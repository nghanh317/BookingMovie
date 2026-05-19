/**
 * contentFilter.js
 * Bộ lọc nội dung bình luận theo tiêu chuẩn ngôn từ Việt Nam
 * Tham chiếu: Nghị định 72/2013/NĐ-CP, Luật An ninh mạng 2018,
 *             Nghị định 15/2020/NĐ-CP về vi phạm hành chính trong lĩnh vực CNTT
 *
 * Các hành vi bị nghiêm cấm:
 * - Xúc phạm danh dự, nhân phẩm của người khác
 * - Dùng ngôn ngữ tục tĩu, thô lỗ
 * - Kích động hận thù, phân biệt đối xử
 * - Đăng tải nội dung bạo lực, đe dọa
 */

// ── Danh sách từ/cụm từ vi phạm ───────────────────────────────────────────
// Được tổ chức theo nhóm để dễ bảo trì

const BANNED_PATTERNS = [
  // Nhóm 1: Từ tục tĩu phổ biến (và biến thể)
  /\b(đ[uụ]t|l[oô]n|c[aă]c|đ[iị]t|buồi|l[aă]c)\b/gi,
  /\b(c[uụ]t|chó\s*chết|đ[eê]o|đ[éê]o|m[aă]y|m[àa]y\s*ch[eê]t)\b/gi,
  /\b(vãi|v[aã]i\s*l[oồ]n|vl+|đmm+|đm+|dm+)\b/gi,
  /\b(thằng\s*chó|con\s*chó|con\s*điếm|thằng\s*điên|con\s*điên)\b/gi,
  /\b(fuck|shit|bitch|asshole|bastard|motherfucker)\b/gi,

  // Nhóm 2: Xúc phạm danh dự, nhân phẩm
  /\b(ngu\s*(như|bằng|tệ)|ngu\s*ngốc|đần\s*độn|điên\s*khùng)\b/gi,
  /\b(khốn\s*nạn|vô\s*học|mất\s*dạy|vô\s*lại|đồ\s*ngu|thằng\s*ngu|con\s*ngu)\b/gi,
  /\b(xấu\s*hổ\s*chết|đáng\s*chết|mày\s*chết\s*đi|cút\s*(đi|xéo)|cút)\b/gi,
  /\b(đồ\s*(khốn|điên|chó|hèn|hại|thối|xấu)|mày\s*là\s*(chó|heo|lợn))\b/gi,

  // Nhóm 3: Đe dọa, bạo lực
  /\b(tao\s*(sẽ|giết|đánh|phang)|tau\s*(giết|đánh))\b/gi,
  /\b(giết\s*(mày|chúng\s*mày|bọn\s*mày)|đập\s*(vỡ|chết|tan))\b/gi,
  /\b(muốn\s*chết\s*không|bảo\s*mày\s*chết)\b/gi,

  // Nhóm 4: Kích động, phân biệt đối xử
  /\b(bắc\s*kỳ|nam\s*kỳ|chệt|mọi|man\s*rợ)\b/gi,
  /\b(kỳ\s*thị|phân\s*biệt\s*chủng\s*tộc)\b/gi,

  // Nhóm 5: Spam / nội dung vô nghĩa
  /(.)\1{6,}/gi, // Lặp ký tự quá 6 lần (aaaaaaa, !!!!!!!!!)
];

// Từ cụ thể cần kiểm tra chính xác (lowercase)
const EXACT_BANNED_WORDS = [
  'đụ', 'dụ má', 'địt', 'lồn', 'cặc', 'buồi', 'đéo', 'vãi lồn',
  'đm', 'đmm', 'dmm', 'vcl', 'vl', 'óc lợn', 'óc chó',
  'mất nết', 'mất dạy', 'khốn nạn', 'vô lại',
  'thằng khốn', 'con khốn', 'đồ khốn',
];

// ── Hàm kiểm tra nội dung ─────────────────────────────────────────────────

/**
 * Kiểm tra nội dung bình luận có vi phạm tiêu chuẩn ngôn từ không
 * @param {string} text - Nội dung cần kiểm tra
 * @returns {{ valid: boolean, violations: string[], message: string }}
 */
export function checkContent(text) {
  if (!text || typeof text !== 'string') {
    return { valid: true, violations: [], message: '' };
  }

  const normalized = text.trim().toLowerCase();
  const violations = new Set();

  // Kiểm tra từ chính xác
  for (const word of EXACT_BANNED_WORDS) {
    if (normalized.includes(word)) {
      violations.add(`"${word}"`);
    }
  }

  // Kiểm tra pattern regex
  for (const pattern of BANNED_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => violations.add(`"${m.trim()}"`));
    }
  }

  // Kiểm tra ALL CAPS quá nhiều (spam)
  const uppercaseRatio = (text.match(/[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g) || []).length / text.length;
  if (uppercaseRatio > 0.7 && text.length > 10) {
    violations.add('viết hoa toàn bộ (spam)');
  }

  if (violations.size > 0) {
    const violationList = [...violations].slice(0, 3).join(', ');
    const more = violations.size > 3 ? ` và ${violations.size - 3} từ khác` : '';
    return {
      valid: false,
      violations: [...violations],
      message: `Bình luận chứa ngôn từ vi phạm tiêu chuẩn cộng đồng: ${violationList}${more}. Vui lòng chỉnh sửa lại nội dung trước khi gửi.`,
    };
  }

  // Kiểm tra độ dài tối thiểu
  if (text.trim().length < 10) {
    return {
      valid: false,
      violations: ['nội dung quá ngắn'],
      message: 'Bình luận cần có ít nhất 10 ký tự. Hãy chia sẻ thêm cảm nhận của bạn!',
    };
  }

  return { valid: true, violations: [], message: '' };
}

/**
 * Highlight các từ vi phạm trong text (dùng cho hiển thị)
 * @param {string} text
 * @returns {string} text với từ vi phạm được wrap bằng <mark>
 */
export function highlightViolations(text) {
  let result = text;
  for (const pattern of BANNED_PATTERNS) {
    result = result.replace(pattern, (match) => `[${match}]`);
  }
  return result;
}

export default { checkContent, highlightViolations };
