export interface AppUser {
  id: string;
  email: string;
  username?: string;
  name: string;
  isMember: boolean;
  isAdmin?: boolean;
  memberTier?: "standard" | "vip";
  memberExpiryDate?: string; // YYYY-MM-DD
  registeredAt: number;
  incenseSticks?: number;
}

export interface DailyIncenseRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DailySageWorshipRecord {
  date: string; // YYYY-MM-DD
  sageIds: string[]; // Danh sách ID các vị Thánh đã bái lễ hôm nay
  rewardClaimed: boolean; // Đã nhận 1 cây hương thưởng hay chưa (mỗi ngày 1 lần)
}

const USERS_STORAGE_KEY = "iching_users_db";
const CURRENT_USER_KEY = "iching_current_user";
const INCENSE_DAILY_KEY = "iching_daily_incense_counts";
const GUEST_INCENSE_KEY = "iching_guest_incense_balance";
const DAILY_SAGE_WORSHIP_KEY = "iching_daily_sage_worship";
const PENDING_REGISTRATIONS_KEY = "iching_pending_registrations";

export interface PendingRegistration {
  email: string;
  passwordHash: string;
  name: string;
  code: string;
  expiresAt: number;
}

// Helper to get today's YYYY-MM-DD string
export const getTodayDateKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export class AuthService {
  /**
   * Khởi tạo và đảm bảo tài khoản Admin tối cao: cuunhi / pass: 999999
   */
  public static ensureAdminAccount(): void {
    try {
      let users: Record<string, { user: AppUser; passwordHash: string }> = {};
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) {
        users = JSON.parse(data);
      }

      const adminKey = "cuunhi";
      const expectedHash = btoa("999999");

      if (!users[adminKey]) {
        users[adminKey] = {
          user: {
            id: "usr_admin_cuunhi",
            email: "cuunhi",
            username: "cuunhi",
            name: "Cửu Nhị Admin",
            isMember: true,
            isAdmin: true,
            memberTier: "vip",
            memberExpiryDate: "2099-12-31",
            registeredAt: Date.now(),
            incenseSticks: 999,
          },
          passwordHash: expectedHash,
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } else {
        let modified = false;
        if (!users[adminKey].user.isAdmin) {
          users[adminKey].user.isAdmin = true;
          modified = true;
        }
        if (users[adminKey].passwordHash !== expectedHash) {
          users[adminKey].passwordHash = expectedHash;
          modified = true;
        }
        if (!users[adminKey].user.username) {
          users[adminKey].user.username = "cuunhi";
          modified = true;
        }
        if (modified) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }
    } catch {}
  }

  private static getUsers(): Record<string, { user: AppUser; passwordHash: string }> {
    try {
      this.ensureAdminAccount();
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {};
  }

  private static saveUsers(users: Record<string, { user: AppUser; passwordHash: string }>) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }

  public static getCurrentUser(): AppUser | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) {
        const u = JSON.parse(data) as AppUser;
        if (typeof u.incenseSticks !== "number") {
          u.incenseSticks = u.isMember ? 30 : 5;
          this.setCurrentUser(u);
        }
        // Đảm bảo cờ isAdmin luôn đồng bộ
        if (u.username === "cuunhi" || u.email === "cuunhi") {
          if (!u.isAdmin) {
            u.isAdmin = true;
            this.setCurrentUser(u);
          }
        }
        return u;
      }
    } catch {}
    return null;
  }

  public static setCurrentUser(user: AppUser | null) {
    try {
      if (user) {
        if (typeof user.incenseSticks !== "number") {
          user.incenseSticks = user.isMember ? 30 : 5;
        }
        if (user.username === "cuunhi" || user.email === "cuunhi") {
          user.isAdmin = true;
        }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      window.dispatchEvent(new CustomEvent("iching-auth-change", { detail: { user } }));
    } catch {}
  }

  private static getPendingRegistrations(): Record<string, PendingRegistration> {
    try {
      const data = localStorage.getItem(PENDING_REGISTRATIONS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {};
  }

  private static savePendingRegistrations(pending: Record<string, PendingRegistration>) {
    try {
      localStorage.setItem(PENDING_REGISTRATIONS_KEY, JSON.stringify(pending));
    } catch {}
  }

  /**
   * Tạo ngẫu nhiên mã OTP xác thực 6 chữ số (VD: 839215)
   */
  public static generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Bước 1 Đăng ký: Kiểm tra thông tin, tạo mã xác thực 6 số gửi tới mail
   * (Đồng thời hiển thị thông báo/toast với mã OTP để tiện điền xác thực ngay)
   */
  public static requestRegistrationCode(
    email: string,
    pass: string,
    name: string
  ): { success: boolean; message: string; code?: string; email?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email!" };
    }
    if (!pass || pass.length < 6) {
      return { success: false, message: "Mật khẩu cần tối thiểu 6 ký tự!" };
    }

    const users = this.getUsers();
    if (users[cleanEmail]) {
      return { success: false, message: "Tài khoản hoặc Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập!" };
    }

    // Tạo mã OTP 6 chữ số
    const code = this.generateOtpCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Có hiệu lực trong 10 phút

    const pending = this.getPendingRegistrations();
    pending[cleanEmail] = {
      email: cleanEmail,
      passwordHash: btoa(pass),
      name: name.trim() || cleanEmail.split("@")[0],
      code,
      expiresAt,
    };
    this.savePendingRegistrations(pending);

    return {
      success: true,
      message: `Mã xác thực 6 số [${code}] đã được gửi đến email ${cleanEmail}!`,
      code,
      email: cleanEmail,
    };
  }

  /**
   * Bước 2 Đăng ký: Nhập mã 6 số để kích hoạt và chính thức đăng nhập
   */
  public static verifyOtpAndRegister(
    email: string,
    inputCode: string
  ): { success: boolean; message: string; user?: AppUser } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, message: "Vui lòng nhập đủ 6 chữ số mã xác thực!" };
    }

    const pending = this.getPendingRegistrations();
    const entry = pending[cleanEmail];

    if (!entry) {
      return {
        success: false,
        message: "Không tìm thấy phiên đăng ký hoặc yêu cầu đã hết hạn. Vui lòng đăng ký lại!",
      };
    }

    if (Date.now() > entry.expiresAt) {
      delete pending[cleanEmail];
      this.savePendingRegistrations(pending);
      return { success: false, message: "Mã xác thực đã hết hạn (sau 10 phút). Vui lòng gửi lại mã mới!" };
    }

    if (entry.code !== cleanCode) {
      return { success: false, message: "Mã xác thực không chính xác. Vui lòng kiểm tra lại 6 chữ số!" };
    }

    // Xác thực thành công: Chính thức tạo tài khoản và tự động đăng nhập
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const newUser: AppUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: entry.name,
      isMember: true,
      memberTier: "vip",
      memberExpiryDate: expiry.toISOString().split("T")[0],
      registeredAt: Date.now(),
    };

    const users = this.getUsers();
    users[cleanEmail] = {
      user: newUser,
      passwordHash: entry.passwordHash,
    };
    this.saveUsers(users);

    // Xóa pending
    delete pending[cleanEmail];
    this.savePendingRegistrations(pending);

    // Chính thức đăng nhập
    this.setCurrentUser(newUser);

    return {
      success: true,
      message: `Xác thực email thành công! Kính chào ${newUser.name}, bạn đã chính thức đăng nhập và mở khóa quyền đọc Thuyết Minh.`,
      user: newUser,
    };
  }

  /**
   * Gửi lại mã xác thực OTP
   */
  public static resendRegistrationCode(
    email: string
  ): { success: boolean; message: string; code?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const pending = this.getPendingRegistrations();
    const entry = pending[cleanEmail];

    if (!entry) {
      return { success: false, message: "Không tìm thấy phiên đăng ký. Vui lòng quay lại form đăng ký!" };
    }

    const newCode = this.generateOtpCode();
    entry.code = newCode;
    entry.expiresAt = Date.now() + 10 * 60 * 1000;
    pending[cleanEmail] = entry;
    this.savePendingRegistrations(pending);

    return {
      success: true,
      message: `Mã xác thực mới [${newCode}] đã được gửi đến email ${cleanEmail}!`,
      code: newCode,
    };
  }

  /**
   * Đăng ký tài khoản trực tiếp (fallback nếu cần)
   */
  public static register(
    email: string,
    pass: string,
    name: string,
    registerAsMember: boolean = true
  ): { success: boolean; message: string; user?: AppUser } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || (!cleanEmail.includes("@") && cleanEmail !== "cuunhi")) {
      return { success: false, message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email!" };
    }
    if (!pass || pass.length < 6) {
      return { success: false, message: "Mật khẩu cần tối thiểu 6 ký tự!" };
    }

    const users = this.getUsers();
    if (users[cleanEmail]) {
      return { success: false, message: "Tài khoản hoặc Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập!" };
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const newUser: AppUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split("@")[0],
      isMember: registerAsMember,
      memberTier: registerAsMember ? "vip" : undefined,
      memberExpiryDate: registerAsMember ? expiry.toISOString().split("T")[0] : undefined,
      registeredAt: Date.now(),
      incenseSticks: 30, // Thành viên đăng ký nhận ngay 30 nén nhang
    };

    users[cleanEmail] = {
      user: newUser,
      passwordHash: btoa(pass),
    };

    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return {
      success: true,
      message: "Đăng ký thành viên thành công! Bạn đã được mở khóa toàn văn Thuyết Minh & trải nghiệm đầy đủ các tính năng.",
      user: newUser,
    };
  }

  /**
   * Đăng nhập tài khoản (hỗ trợ cả Email hoặc Tên đăng nhập cuunhi, mật khẩu 999999)
   */
  public static login(identifier: string, pass: string): { success: boolean; message: string; user?: AppUser } {
    const cleanId = identifier.trim().toLowerCase();
    this.ensureAdminAccount();
    const users = this.getUsers();

    // 1. Tìm tài khoản theo key hoặc username hoặc email
    let account = users[cleanId];
    if (!account) {
      const foundEntry = Object.values(users).find(
        (acc) =>
          acc.user.username?.toLowerCase() === cleanId ||
          acc.user.email.toLowerCase() === cleanId
      );
      if (foundEntry) {
        account = foundEntry;
      }
    }

    // 2. Xử lý đặc biệt nếu là admin cuunhi với pass 999999
    if (cleanId === "cuunhi" && pass === "999999") {
      account = users["cuunhi"];
    }

    if (!account) {
      return { success: false, message: "Tài khoản không tồn tại. Vui lòng kiểm tra lại email/tên đăng nhập!" };
    }

    if (account.passwordHash !== btoa(pass)) {
      return { success: false, message: "Mật khẩu không chính xác. Vui lòng thử lại!" };
    }

    this.setCurrentUser(account.user);

    if (account.user.isAdmin) {
      return {
        success: true,
        message: `Đăng nhập thành công với quyền QUẢN TRỊ VIÊN CỬU NHỊ (cuunhi)! Toàn quyền quản trị danh sách tài khoản & hệ thống.`,
        user: account.user,
      };
    }

    return {
      success: true,
      message: `Đăng nhập thành công! Kính chào ${account.user.name}. Đã mở khóa toàn văn Thuyết Minh.`,
      user: account.user,
    };
  }

  /**
   * Đăng xuất
   */
  public static logout() {
    this.setCurrentUser(null);
  }

  /**
   * Nâng cấp người dùng hiện tại lên thành viên VIP (nhận thêm 30 nén nhang)
   */
  public static upgradeToMember(email?: string): { success: boolean; message: string; user?: AppUser } {
    const curUser = this.getCurrentUser();
    const targetEmail = (email || curUser?.email || "").toLowerCase();

    const users = this.getUsers();
    if (!users[targetEmail]) {
      return { success: false, message: "Không tìm thấy tài khoản để nâng cấp." };
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const prevSticks = users[targetEmail].user.incenseSticks || 0;
    const updatedUser: AppUser = {
      ...users[targetEmail].user,
      isMember: true,
      memberTier: "vip",
      memberExpiryDate: expiry.toISOString().split("T")[0],
      incenseSticks: prevSticks < 30 ? 30 : prevSticks + 30,
    };

    users[targetEmail].user = updatedUser;
    this.saveUsers(users);

    if (curUser && curUser.email === targetEmail) {
      this.setCurrentUser(updatedUser);
    }

    return {
      success: true,
      message: "Chúc mừng bạn đã kích hoạt Hội Viên VIP! Được cộng 30 nén nhang dâng lễ & mở toàn văn Thuyết Minh.",
      user: updatedUser,
    };
  }

  /**
   * Lấy số nhang hiện có của người dùng
   */
  public static getIncenseBalance(user?: AppUser | null): number {
    const target = user || this.getCurrentUser();
    if (target) {
      if (typeof target.incenseSticks === "number") {
        return target.incenseSticks;
      }
      return target.isMember ? 30 : 5;
    }
    // Khách vãng lai: mặc định cho 1 nén để trải nghiệm
    try {
      const guestVal = localStorage.getItem(GUEST_INCENSE_KEY);
      if (guestVal !== null) return parseInt(guestVal, 10);
    } catch {}
    return 1;
  }

  /**
   * Khấu trừ số nén nhang khi dâng hương (1, 3, hoặc 5 nén)
   */
  public static deductIncense(
    count: number,
    user?: AppUser | null
  ): { success: boolean; newBalance: number } {
    const curUser = user || this.getCurrentUser();
    if (curUser) {
      const curBalance = this.getIncenseBalance(curUser);
      if (curBalance < count) {
        return { success: false, newBalance: curBalance };
      }
      const newBalance = curBalance - count;
      const updatedUser: AppUser = {
        ...curUser,
        incenseSticks: newBalance,
      };

      const users = this.getUsers();
      if (users[curUser.email.toLowerCase()]) {
        users[curUser.email.toLowerCase()].user = updatedUser;
        this.saveUsers(users);
      }
      this.setCurrentUser(updatedUser);
      return { success: true, newBalance };
    } else {
      // Khách vãng lai
      const curBalance = this.getIncenseBalance(null);
      if (curBalance < count) {
        return { success: false, newBalance: curBalance };
      }
      const newBalance = curBalance - count;
      try {
        localStorage.setItem(GUEST_INCENSE_KEY, String(newBalance));
      } catch {}
      return { success: true, newBalance };
    }
  }

  /**
   * Thêm nhang vào kho (tặng thêm)
   */
  public static addIncense(count: number, user?: AppUser | null): number {
    const curUser = user || this.getCurrentUser();
    if (curUser) {
      const newBalance = (curUser.incenseSticks || 0) + count;
      const updatedUser: AppUser = {
        ...curUser,
        incenseSticks: newBalance,
      };
      const users = this.getUsers();
      if (users[curUser.email.toLowerCase()]) {
        users[curUser.email.toLowerCase()].user = updatedUser;
        this.saveUsers(users);
      }
      this.setCurrentUser(updatedUser);
      return newBalance;
    }
    const guestBal = this.getIncenseBalance(null) + count;
    try {
      localStorage.setItem(GUEST_INCENSE_KEY, String(guestBal));
    } catch {}
    return guestBal;
  }

  /**
   * Lấy số lần dâng hương hôm nay của người dùng
   */
  public static getTodayIncenseCount(userId?: string): number {
    try {
      const today = getTodayDateKey();
      const storeKey = `${INCENSE_DAILY_KEY}_${userId || "guest"}`;
      const data = localStorage.getItem(storeKey);
      if (data) {
        const parsed = JSON.parse(data) as DailyIncenseRecord;
        if (parsed.date === today) {
          return parsed.count;
        }
      }
    } catch {}
    return 0;
  }

  /**
   * Ghi nhận 1 lần dâng hương
   */
  public static incrementTodayIncense(userId?: string): number {
    const today = getTodayDateKey();
    const storeKey = `${INCENSE_DAILY_KEY}_${userId || "guest"}`;
    let count = this.getTodayIncenseCount(userId);
    count += 1;
    try {
      localStorage.setItem(storeKey, JSON.stringify({ date: today, count }));
    } catch {}
    return count;
  }

  /**
   * Lấy danh sách các vị Thánh Hiền đã bái lễ hôm nay
   */
  public static getTodaySageWorship(userId?: string): { sageIds: string[]; rewardClaimed: boolean } {
    try {
      const today = getTodayDateKey();
      const storeKey = `${DAILY_SAGE_WORSHIP_KEY}_${userId || "guest"}`;
      const data = localStorage.getItem(storeKey);
      if (data) {
        const parsed = JSON.parse(data) as DailySageWorshipRecord;
        if (parsed.date === today) {
          return {
            sageIds: Array.isArray(parsed.sageIds) ? parsed.sageIds : [],
            rewardClaimed: !!parsed.rewardClaimed,
          };
        }
      }
    } catch {}
    return { sageIds: [], rewardClaimed: false };
  }

  /**
   * Ghi nhận bái lễ 1 vị Thánh Hiền.
   * Khi bái lễ đủ 5 vị thì sẽ nhận được 1 cây hương, mỗi ngày 1 lần.
   */
  public static recordSageWorship(
    sageId: string,
    user?: AppUser | null,
    totalRequiredSages: number = 5
  ): {
    worshippedSages: string[];
    isNewSage: boolean;
    rewardEarned: boolean;
    newBalance: number;
    message: string;
  } {
    const today = getTodayDateKey();
    const curUser = user !== undefined ? user : this.getCurrentUser();
    const userId = curUser?.id || "guest";
    const storeKey = `${DAILY_SAGE_WORSHIP_KEY}_${userId}`;

    const currentRecord = this.getTodaySageWorship(userId);
    const existingSet = new Set(currentRecord.sageIds);
    const isNewSage = !existingSet.has(sageId);
    existingSet.add(sageId);
    const updatedSageIds = Array.from(existingSet);

    let rewardEarned = false;
    let rewardClaimed = currentRecord.rewardClaimed;
    let balance = this.getIncenseBalance(curUser);

    // Nếu đã bái lễ đủ 5 vị và chưa nhận thưởng 1 cây hương hôm nay
    if (updatedSageIds.length >= totalRequiredSages && !rewardClaimed) {
      rewardEarned = true;
      rewardClaimed = true;
      balance = this.addIncense(1, curUser);
    }

    try {
      const recordToSave: DailySageWorshipRecord = {
        date: today,
        sageIds: updatedSageIds,
        rewardClaimed,
      };
      localStorage.setItem(storeKey, JSON.stringify(recordToSave));
    } catch {}

    let message = "";
    if (rewardEarned) {
      message = `🎉 VIÊN MÃN CÔNG ĐỨC! Bạn đã bái lễ đủ ${totalRequiredSages} vị Thánh hôm nay và nhận được 1 CÂY HƯƠNG vào kho nhang (Mỗi ngày 1 lần). Kho hiện có: ${balance} nén!`;
    } else if (isNewSage) {
      message = `Đã thành tâm bái lễ (${updatedSageIds.length}/${totalRequiredSages} vị hôm nay). Bái đủ ${totalRequiredSages} vị sẽ nhận 1 cây hương!`;
    } else {
      message = `Đã kính bái vị Thánh này trước đó (${updatedSageIds.length}/${totalRequiredSages} vị).`;
    }

    // Phát custom event để đồng bộ UI
    try {
      window.dispatchEvent(
        new CustomEvent("iching-sage-worship-change", {
          detail: {
            sageId,
            worshippedSages: updatedSageIds,
            rewardEarned,
            newBalance: balance,
          },
        })
      );
    } catch {}

    return {
      worshippedSages: updatedSageIds,
      isNewSage,
      rewardEarned,
      newBalance: balance,
      message,
    };
  }

  // ========================================================
  // CÁC HÀM DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN CUUNHI)
  // ========================================================

  /**
   * Lấy toàn bộ danh sách tài khoản đã đăng ký trong hệ thống
   */
  public static getAllUsers(): Array<{
    user: AppUser;
    todayIncenseCount: number;
    accountKey: string;
  }> {
    this.ensureAdminAccount();
    const users = this.getUsers();
    return Object.entries(users).map(([key, val]) => ({
      user: val.user,
      todayIncenseCount: this.getTodayIncenseCount(val.user.id),
      accountKey: key,
    }));
  }

  /**
   * Admin điều chỉnh số nhang trong kho của bất kỳ tài khoản nào
   */
  public static updateUserIncense(
    targetKeyOrId: string,
    newIncenseSticks: number
  ): { success: boolean; message: string; user?: AppUser } {
    const users = this.getUsers();
    const cleanTarget = targetKeyOrId.trim().toLowerCase();

    let foundKey = Object.keys(users).find(
      (k) =>
        k.toLowerCase() === cleanTarget ||
        users[k].user.id === targetKeyOrId ||
        users[k].user.email.toLowerCase() === cleanTarget ||
        users[k].user.username?.toLowerCase() === cleanTarget
    );

    if (!foundKey) {
      return { success: false, message: "Không tìm thấy tài khoản cần chỉnh sửa số nhang." };
    }

    const safeSticks = Math.max(0, Math.floor(newIncenseSticks));
    users[foundKey].user.incenseSticks = safeSticks;
    this.saveUsers(users);

    // Đồng bộ nếu là người dùng hiện tại đang đăng nhập
    const curUser = this.getCurrentUser();
    if (curUser && curUser.id === users[foundKey].user.id) {
      this.setCurrentUser(users[foundKey].user);
    }

    window.dispatchEvent(
      new CustomEvent("iching-admin-data-change", {
        detail: { action: "update-incense", userId: users[foundKey].user.id, newIncenseSticks: safeSticks },
      })
    );

    return {
      success: true,
      message: `Đã chỉnh số nhang của [${users[foundKey].user.name}] thành ${safeSticks} nén.`,
      user: users[foundKey].user,
    };
  }

  /**
   * Admin điều chỉnh số lần dâng hương hôm nay của bất kỳ tài khoản nào
   */
  public static updateUserDailyIncense(
    userId: string,
    newCount: number
  ): { success: boolean; message: string } {
    const today = getTodayDateKey();
    const storeKey = `${INCENSE_DAILY_KEY}_${userId || "guest"}`;
    const safeCount = Math.max(0, Math.floor(newCount));
    try {
      localStorage.setItem(storeKey, JSON.stringify({ date: today, count: safeCount }));
      window.dispatchEvent(
        new CustomEvent("iching-admin-data-change", {
          detail: { action: "update-daily-incense", userId, count: safeCount },
        })
      );
      return {
        success: true,
        message: `Đã chỉnh số lần dâng hương hôm nay thành ${safeCount} lần.`,
      };
    } catch {
      return { success: false, message: "Không thể cập nhật số lần dâng hương." };
    }
  }

  /**
   * Admin chỉnh sửa quyền Hội Viên của tài khoản
   */
  public static updateUserMembership(
    targetKeyOrId: string,
    isMember: boolean,
    tier: "standard" | "vip" = "vip"
  ): { success: boolean; message: string; user?: AppUser } {
    const users = this.getUsers();
    const cleanTarget = targetKeyOrId.trim().toLowerCase();

    let foundKey = Object.keys(users).find(
      (k) =>
        k.toLowerCase() === cleanTarget ||
        users[k].user.id === targetKeyOrId ||
        users[k].user.email.toLowerCase() === cleanTarget ||
        users[k].user.username?.toLowerCase() === cleanTarget
    );

    if (!foundKey) {
      return { success: false, message: "Không tìm thấy tài khoản cần chỉnh sửa." };
    }

    users[foundKey].user.isMember = isMember;
    users[foundKey].user.memberTier = isMember ? tier : undefined;
    if (isMember && !users[foundKey].user.memberExpiryDate) {
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      users[foundKey].user.memberExpiryDate = exp.toISOString().split("T")[0];
    }
    this.saveUsers(users);

    const curUser = this.getCurrentUser();
    if (curUser && curUser.id === users[foundKey].user.id) {
      this.setCurrentUser(users[foundKey].user);
    }

    window.dispatchEvent(
      new CustomEvent("iching-admin-data-change", {
        detail: { action: "update-membership", userId: users[foundKey].user.id, isMember },
      })
    );

    return {
      success: true,
      message: `Đã cập nhật trạng thái hội viên của [${users[foundKey].user.name}] thành ${isMember ? "Hội Viên VIP" : "Khách thường"}.`,
      user: users[foundKey].user,
    };
  }

  /**
   * Admin xóa tài khoản khác (bảo vệ tuyệt đối tài khoản admin cuunhi)
   */
  public static deleteUser(targetKeyOrId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const cleanTarget = targetKeyOrId.trim().toLowerCase();

    let foundKey = Object.keys(users).find(
      (k) =>
        k.toLowerCase() === cleanTarget ||
        users[k].user.id === targetKeyOrId ||
        users[k].user.email.toLowerCase() === cleanTarget ||
        users[k].user.username?.toLowerCase() === cleanTarget
    );

    if (!foundKey) {
      return { success: false, message: "Không tìm thấy tài khoản cần xóa." };
    }

    // Bảo vệ tài khoản admin cuunhi
    if (
      foundKey === "cuunhi" ||
      users[foundKey].user.username === "cuunhi" ||
      users[foundKey].user.email === "cuunhi" ||
      users[foundKey].user.isAdmin
    ) {
      return { success: false, message: "Tuyệt đối không thể xóa tài khoản Quản Trị Viên Tối Cao (cuunhi)!" };
    }

    const deletedUserName = users[foundKey].user.name;
    const deletedUserId = users[foundKey].user.id;

    // Xóa khỏi bảng lưu trữ
    delete users[foundKey];
    this.saveUsers(users);

    // Xóa bộ đếm dâng hương liên quan
    try {
      localStorage.removeItem(`${INCENSE_DAILY_KEY}_${deletedUserId}`);
    } catch {}

    window.dispatchEvent(
      new CustomEvent("iching-admin-data-change", {
        detail: { action: "delete-user", userId: deletedUserId },
      })
    );

    return {
      success: true,
      message: `Đã xóa tài khoản [${deletedUserName}] thành công khỏi hệ thống.`,
    };
  }

  /**
   * Admin tạo nhanh một tài khoản mới
   */
  public static createUserByAdmin(data: {
    name: string;
    email: string;
    pass: string;
    isMember?: boolean;
    incenseSticks?: number;
  }): { success: boolean; message: string; user?: AppUser } {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: "Email hoặc tên đăng nhập không được để trống!" };
    }

    const users = this.getUsers();
    if (users[cleanEmail]) {
      return { success: false, message: "Tài khoản hoặc email này đã tồn tại!" };
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const newUser: AppUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      username: cleanEmail.includes("@") ? cleanEmail.split("@")[0] : cleanEmail,
      name: data.name.trim() || cleanEmail,
      isMember: data.isMember ?? true,
      memberTier: (data.isMember ?? true) ? "vip" : undefined,
      memberExpiryDate: (data.isMember ?? true) ? expiry.toISOString().split("T")[0] : undefined,
      registeredAt: Date.now(),
      incenseSticks: data.incenseSticks ?? 30,
    };

    users[cleanEmail] = {
      user: newUser,
      passwordHash: btoa(data.pass || "123456"),
    };

    this.saveUsers(users);

    window.dispatchEvent(
      new CustomEvent("iching-admin-data-change", {
        detail: { action: "create-user", user: newUser },
      })
    );

    return {
      success: true,
      message: `Đã tạo tài khoản [${newUser.name}] thành công.`,
      user: newUser,
    };
  }
}
