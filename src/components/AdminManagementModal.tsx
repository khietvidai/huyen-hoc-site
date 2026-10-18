import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Users,
  Crown,
  Trash2,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  Plus,
  Calendar,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { AuthService, AppUser } from "../services/authService";

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onShowToast?: (msg: string) => void;
}

interface UserRecordItem {
  user: AppUser;
  accountKey: string;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast,
}) => {
  const [usersList, setUsersList] = useState<UserRecordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "member" | "admin">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Đang kết nối...");

  // State xác nhận xóa tài khoản
  const [deletingUser, setDeletingUser] = useState<UserRecordItem | null>(null);

  // State tạo tài khoản mới
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPass, setNewUserPass] = useState("123456");
  const [newUserIsMember, setNewUserIsMember] = useState(true);

  // Lưu trữ các ID người dùng đã thấy để thông báo khi có người mới đăng ký
  const knownUserIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef(true);

  const loadData = async (showToastOnNew = true) => {
    setIsRefreshing(true);
    try {
      const list = await AuthService.fetchUsersFromServer();
      const mapped = list.map((i) => ({ user: i.user, accountKey: i.accountKey }));

      // Kiểm tra xem có người đăng ký mới trên các máy khác không
      if (!isInitialLoadRef.current && showToastOnNew) {
        const newUsers = mapped.filter((item) => !knownUserIdsRef.current.has(item.user.id));
        if (newUsers.length > 0) {
          const names = newUsers.map((u) => `${u.user.name} (${u.user.email})`).join(", ");
          if (onShowToast) {
            onShowToast(`🔔 Có ${newUsers.length} tài khoản mới vừa đăng ký: ${names}!`);
          }
        }
      }

      const updatedIds = new Set<string>();
      mapped.forEach((item) => updatedIds.add(item.user.id));
      knownUserIdsRef.current = updatedIds;
      isInitialLoadRef.current = false;

      setUsersList(mapped);
      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch (e) {
      console.error("Lỗi khi tải danh sách người dùng:", e);
      const list = AuthService.getAllUsers();
      setUsersList(list.map((i) => ({ user: i.user, accountKey: i.accountKey })));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Tự động kiểm tra và đồng bộ mỗi 3.5 giây khi mở bảng Quản trị
  useEffect(() => {
    if (!isOpen) {
      isInitialLoadRef.current = true;
      return;
    }

    loadData(false);

    const interval = setInterval(() => {
      loadData(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const handleAdminEvent = () => {
      loadData(false);
    };
    window.addEventListener("iching-admin-data-change", handleAdminEvent);
    return () => window.removeEventListener("iching-admin-data-change", handleAdminEvent);
  }, []);

  if (!isOpen) return null;

  // Lọc danh sách theo từ khóa và bộ lọc
  const filteredUsers = usersList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.user.name.toLowerCase().includes(q) ||
      item.user.email.toLowerCase().includes(q) ||
      (item.user.username && item.user.username.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (filterType === "member") return item.user.isMember;
    if (filterType === "admin") return !!item.user.isAdmin;
    return true;
  });

  // Thống kê nhanh
  const totalUsers = usersList.length;
  const totalMembers = usersList.filter((u) => u.user.isMember).length;
  const totalGuests = totalUsers - totalMembers;
  const totalAdmins = usersList.filter((u) => u.user.isAdmin).length;

  // Xử lý chuyển đổi quyền hội viên
  const handleToggleMembership = async (targetKey: string, currentIsMember: boolean) => {
    const res = await AuthService.updateUserMembership(targetKey, !currentIsMember);
    if (onShowToast) onShowToast(res.message);
    await loadData(false);
  };

  // Xử lý xóa tài khoản
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    const res = await AuthService.deleteUser(deletingUser.accountKey);
    if (onShowToast) onShowToast(res.message);
    setDeletingUser(null);
    await loadData(false);
  };

  // Xử lý tạo tài khoản mới
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await AuthService.createUserByAdmin({
      name: newUserName,
      email: newUserEmail,
      pass: newUserPass,
      isMember: newUserIsMember,
    });
    if (res.success) {
      if (onShowToast) onShowToast(res.message);
      setIsCreatingUser(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPass("123456");
      await loadData(false);
    } else {
      if (onShowToast) onShowToast(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#140F0A] border-2 border-[#C9A55A] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-[#EDE0D0] font-serif">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-7 border-b border-[#3E2B18] bg-gradient-to-r from-[#20150D] via-[#170E08] to-[#20150D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] shadow-md border border-[#E6D3A3] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#F5EAD4]">
                  QUẢN TRỊ VIÊN HỆ THỐNG CỬU NHỊ
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-600/60">
                  ROOT ADMIN
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 text-[10px] font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Trực tuyến • Tự động đồng bộ 3s</span>
                </span>
              </div>
              <p className="text-xs text-[#A89882] flex items-center gap-2 mt-0.5">
                <span>Xem danh sách tài khoản • Quản lý hội viên VIP • Cập nhật lúc: {lastSyncTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-[#22170D] hover:bg-[#342416] text-[#C9A55A] border border-[#4A321D] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-serif shadow-xs"
              title="Làm mới dữ liệu từ máy chủ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-300" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#22170D] hover:bg-rose-950 text-[#8C7A65] hover:text-rose-300 border border-[#4A321D] transition-colors cursor-pointer"
              title="Đóng bảng quản trị"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#1A120B] border border-[#44301B] rounded-2xl p-3.5 shadow-sm space-y-1">
              <div className="text-[11px] text-[#998772] flex items-center justify-between">
                <span>Tổng Tài Khoản:</span>
                <Users className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-[#E6D3A3]">{totalUsers}</div>
              <div className="text-[10px] text-[#7A6A57]">Đã đăng ký hệ thống</div>
            </div>

            <div className="bg-[#1A120B] border border-[#44301B] rounded-2xl p-3.5 shadow-sm space-y-1">
              <div className="text-[11px] text-[#998772] flex items-center justify-between">
                <span>Hội Viên VIP:</span>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-amber-300">{totalMembers}</div>
              <div className="text-[10px] text-[#7A6A57]">Mở khóa toàn bộ Thuyết Minh</div>
            </div>

            <div className="bg-[#1A120B] border border-[#44301B] rounded-2xl p-3.5 shadow-sm space-y-1">
              <div className="text-[11px] text-[#998772] flex items-center justify-between">
                <span>Tài Khoản Thường:</span>
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-sky-300">{totalGuests}</div>
              <div className="text-[10px] text-[#7A6A57]">Thành viên tiêu chuẩn</div>
            </div>

            <div className="bg-[#1A120B] border border-[#44301B] rounded-2xl p-3.5 shadow-sm space-y-1">
              <div className="text-[11px] text-[#998772] flex items-center justify-between">
                <span>Quản Trị Viên:</span>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-red-300">{totalAdmins}</div>
              <div className="text-[10px] text-[#7A6A57]">Quyền Root Admin</div>
            </div>
          </div>

          {/* Action Bar: Search, Filters & Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#1A120B] border border-[#44301B] p-3 rounded-2xl">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#7A6A57]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo Tên, Email hoặc Tên đăng nhập..."
                className="w-full bg-[#110D09] border border-[#3E2D1A] focus:border-[#C9A55A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F2E5D2] placeholder-[#665442] outline-none font-serif"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[#7A6A57] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { id: "all", label: `Tất cả (${totalUsers})` },
                  { id: "member", label: `Hội viên (${totalMembers})` },
                  { id: "admin", label: `Admin (${totalAdmins})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif transition-colors whitespace-nowrap cursor-pointer ${
                    filterType === tab.id
                      ? "bg-[#C9A55A] text-black font-bold shadow"
                      : "bg-[#22170E] text-[#998772] hover:text-white border border-[#3D2917]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Admin Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingUser(!isCreatingUser)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:from-[#E6D3A3] hover:to-[#C9A55A] text-black text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Tạo Tài Khoản Mới</span>
              </button>
            </div>
          </div>

          {/* Form Thêm Tài Khoản Mới */}
          {isCreatingUser && (
            <div className="p-4 rounded-2xl bg-[#1C130B] border border-[#523A20] shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-[#E6D3A3]">
                <span className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>TẠO TÀI KHOẢN MỚI THỦ CÔNG</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingUser(false)}
                  className="text-[#8C7A65] hover:text-white text-xs cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#A6957F] mb-1">Họ và tên:</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full bg-[#110D09] border border-[#3E2D1A] rounded-xl px-3 py-1.5 text-xs text-[#F2E5D2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6957F] mb-1">Email / Tên đăng nhập:</label>
                  <input
                    type="text"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="VD: user@example.com hoặc username"
                    className="w-full bg-[#110D09] border border-[#3E2D1A] rounded-xl px-3 py-1.5 text-xs text-[#F2E5D2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6957F] mb-1">Mật khẩu:</label>
                  <input
                    type="text"
                    required
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full bg-[#110D09] border border-[#3E2D1A] rounded-xl px-3 py-1.5 text-xs text-[#F2E5D2] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="new-is-member"
                    checked={newUserIsMember}
                    onChange={(e) => setNewUserIsMember(e.target.checked)}
                    className="rounded accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="new-is-member" className="text-xs text-[#D6C7B2] cursor-pointer">
                    Cấp đặc quyền Hội Viên VIP (Mở khóa toàn văn Thuyết Minh)
                  </label>
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="px-3 py-1.5 rounded-xl bg-[#22170D] hover:bg-[#2C1E12] text-[#A6957F] text-xs cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-black font-bold text-xs cursor-pointer shadow"
                  >
                    Tạo Tài Khoản
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bảng Danh Sách Tài Khoản */}
          <div className="bg-[#18110B] border border-[#44301B] rounded-2xl overflow-hidden shadow-lg">
            <div className="p-3.5 border-b border-[#342211] flex items-center justify-between text-xs text-[#E6D3A3] font-bold">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>DANH SÁCH TÀI KHOẢN ĐĂNG KÝ ({filteredUsers.length})</span>
              </span>
              <span className="text-[11px] text-[#8C7A65] font-normal">
                Quản lý quyền hội viên và phân cấp tài khoản
              </span>
            </div>

            <div className="divide-y divide-[#2B1D11] overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-[#8C7A65] text-xs">
                  Không tìm thấy tài khoản nào khớp với tiêu chí tìm kiếm.
                </div>
              ) : (
                filteredUsers.map((item) => {
                  const u = item.user;
                  const isCurrentAdmin = u.username === "cuunhi" || u.email === "cuunhi" || !!u.isAdmin;

                  return (
                    <div
                      key={u.id}
                      className="p-3.5 sm:p-4 hover:bg-[#20160D] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Cột 1: Thông tin người dùng */}
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isCurrentAdmin
                              ? "bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                              : u.isMember
                              ? "bg-amber-950/80 border-amber-500 text-amber-300"
                              : "bg-[#24170E] border-[#442F1B] text-[#998772]"
                          }`}
                        >
                          {isCurrentAdmin ? "🛡️" : u.isMember ? "👑" : "👤"}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-[#F5EAD4] truncate">
                              {u.name}
                            </span>
                            {isCurrentAdmin && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900/80 text-red-200 border border-red-600 font-mono">
                                Admin
                              </span>
                            )}
                            {u.isMember && !isCurrentAdmin && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/90 text-amber-300 border border-amber-600 font-mono">
                                Hội Viên VIP
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-[#A6957F] font-mono truncate">
                            {u.email}
                          </div>

                          <div className="text-[10px] text-[#6E5D4B] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#6E5D4B]" />
                            <span>Đăng ký: {new Date(u.registeredAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cột 2: Cấp bậc Hội viên */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#A89882]">Trạng thái:</span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-xl border font-bold ${
                            u.isMember
                              ? "bg-amber-950/60 text-amber-300 border-amber-600/60"
                              : "bg-[#1E1710] text-[#8C7A65] border-[#382618]"
                          }`}
                        >
                          {u.isMember ? "⭐ Hội Viên VIP" : "Tài Khoản Thường"}
                        </span>
                      </div>

                      {/* Cột 3: THAO TÁC (Đổi Hội Viên & Xóa Tài Khoản) */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Toggle Member */}
                        {!isCurrentAdmin && (
                          <button
                            type="button"
                            onClick={() => handleToggleMembership(item.accountKey, u.isMember)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-serif cursor-pointer transition-colors flex items-center gap-1.5 ${
                              u.isMember
                                ? "bg-amber-950/70 border-amber-600/70 text-amber-300 hover:bg-amber-900"
                                : "bg-[#20150D] border-[#3D2916] text-[#A6957F] hover:text-white"
                            }`}
                            title={u.isMember ? "Hạ xuống tài khoản thường" : "Nâng cấp lên Hội viên VIP"}
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>{u.isMember ? "Hạ xuống Thường" : "Cấp VIP"}</span>
                          </button>
                        )}

                        {/* Nút Xóa tài khoản */}
                        {isCurrentAdmin ? (
                          <div
                            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-600 text-xs font-serif select-none"
                            title="Tài khoản Quản Trị Tối Cao không thể xóa"
                          >
                            Bảo vệ
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingUser(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/70 text-rose-300 text-xs font-serif cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                            title={`Xóa tài khoản ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 sm:px-7 border-t border-[#3E2B18] bg-[#1A120B] flex items-center justify-between text-xs text-[#8C7A65] shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hệ thống quản trị Cửu Nhị đang hoạt động trực tuyến</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-black font-bold text-xs cursor-pointer shadow hover:brightness-110 active:scale-95 transition-all"
          >
            Hoàn Tất & Đóng
          </button>
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA TÀI KHOẢN */}
      {deletingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1C120A] border-2 border-rose-500 rounded-3xl p-6 shadow-2xl space-y-4 text-center font-serif">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-rose-300">
              XÁC NHẬN XÓA TÀI KHOẢN?
            </h3>

            <p className="text-xs text-[#D9C4AC] leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản{" "}
              <strong className="text-white font-bold">[{deletingUser.user.name}]</strong>{" "}
              (Email: <span className="font-mono text-amber-300">{deletingUser.user.email}</span>)?
            </p>

            <div className="p-3 rounded-xl bg-black/60 border border-rose-900/60 text-[11px] text-rose-300/90 text-left space-y-1">
              <div>• Toàn bộ dữ liệu quẻ gieo và tài khoản sẽ bị xóa hoàn toàn.</div>
              <div>• Hành động này không thể hoàn tác!</div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-[#2C1D12] hover:bg-[#3D2919] text-[#A6957F] text-xs font-bold cursor-pointer transition-colors"
              >
                Hủy bỏ (Giữ lại)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white text-xs font-bold shadow-lg cursor-pointer transition-all border border-rose-500"
              >
                Đồng Ý Xóa Tài Khoản ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
