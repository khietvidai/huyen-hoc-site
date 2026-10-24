# Antigravity CLI (`agy`) & `agentapi` Reference

## 1. Cài đặt Antigravity CLI

- **Windows (PowerShell):**
  ```powershell
  irm https://antigravity.google/cli/install.ps1 | iex
  ```
- **Windows (WinGet):**
  ```cmd
  winget install Google.Antigravity.CLI
  ```
- **macOS / Linux:**
  ```bash
  curl -fsSL https://antigravity.google/cli/install.sh | bash
  ```

---

## 2. Các tham số CLI phổ biến (`agy`)

- `agy`: Khởi chạy giao diện tương tác terminal TUI.
- `-p, --prompt "<text>"`: Chạy chế độ headless (không cần tương tác qua TUI), thực thi prompt rồi thoát.
- `--model <flash|pro|flash_lite>`: Lựa chọn mô hình cho phiên làm việc.
- `--profile <profile_name>`: Tải cấu hình profile được chỉ định.
- `--version`: Hiển thị phiên bản hiện tại của `agy`.
- `--help`: Danh sách cờ và câu lệnh chi tiết.

---

## 3. Tích hợp programmatic: `agentapi`

Tệp thực thi `agentapi` (được cấu hình sẵn tại `~/.gemini/antigravity/bin/agentapi.bat`) cho phép điều phối các phiên làm việc của Antigravity thông qua CLI:

- **Tạo hội thoại mới:**
  ```bash
  agentapi new-conversation [--model=flash|pro] [--title="Tiêu đề"] "Nội dung prompt"
  ```
- **Gửi tin nhắn vào hội thoại đang chạy:**
  ```bash
  agentapi send-message <recipient_id> "Nội dung"
  ```
- **Lấy siêu dữ liệu hội thoại:**
  ```bash
  agentapi get-conversation-metadata <conversation_id>
  ```

---

## 4. Tệp cấu hình CLI

Cấu hình của Antigravity CLI được lưu tại:
`~/.gemini/antigravity-cli/settings.json`

Các thiết lập bao gồm mô hình mặc định, chế độ tự động thực thi (auto-execution policy), và các quyền truy cập tệp.
