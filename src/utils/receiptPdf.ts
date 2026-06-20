// src/utils/receiptPdf.ts
// npm install jspdf  (đã có nếu dùng ở dự án gym)
import jsPDF from 'jspdf';
import { SavedOrder } from '../services/orderService';
import { NOTOSANS_REGULAR_BASE64, NOTOSANS_BOLD_BASE64 } from './vietnameseFont';

const METHOD_LABEL: Record<string, string> = {
    cash: 'Tiền mặt',
    qr: 'Chuyển khoản QR',
};

/**
 * Font chuẩn của jsPDF (helvetica/times/courier) chỉ hỗ trợ WinAnsi/Latin-1,
 * KHÔNG có glyph cho ký tự tiếng Việt có dấu (á, đ, ơ, ư...).
 * Dùng helvetica để in "HÓA ĐƠN BÁN HÀNG" sẽ ra ký tự rác kiểu "&H&Ó&A&...".
 * -> Phải nhúng 1 font TTF hỗ trợ Unicode (ở đây dùng NotoSans - subset Latin+Vietnamese)
 *    vào Virtual File System của jsPDF rồi gọi addFont().
 */
function registerVietnameseFont(doc: jsPDF) {
    doc.addFileToVFS('NotoSans-Regular.ttf', NOTOSANS_REGULAR_BASE64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');

    doc.addFileToVFS('NotoSans-Bold.ttf', NOTOSANS_BOLD_BASE64);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}

export function exportReceiptPdf(order: SavedOrder) {
    const doc = new jsPDF({ unit: 'mm', format: [80, 200], orientation: 'portrait' });
    registerVietnameseFont(doc);
    doc.setFont('NotoSans', 'normal'); // đặt font mặc định ngay từ đầu

    let y = 8;
    const lx = 5;
    const rx = 75;
    const mid = 40;

    // --- Header ---
    doc.setFontSize(13);
    doc.setFont('NotoSans', 'bold');
    doc.text('CS MANAGER', mid, y, { align: 'center' });

    y += 5;
    doc.setFontSize(8);
    doc.setFont('NotoSans', 'normal');
    doc.text('HÓA ĐƠN BÁN HÀNG', mid, y, { align: 'center' });

    y += 4;
    doc.setLineWidth(0.3);
    doc.line(lx, y, rx, y);

    y += 4;
    doc.setFontSize(7.5);
    doc.text(`Mã đơn: ${order.orderCode}`, lx, y);
    y += 4;
    // FIX: order.createdAt giờ là string (ISO) từ BE, không phải Date
    // -> phải new Date(...) trước khi gọi toLocaleString, nếu không sẽ
    // bị "TypeError: order.createdAt.toLocaleString is not a function"
    doc.text(`Ngày: ${new Date(order.createdAt).toLocaleString('vi-VN')}`, lx, y);
    y += 4;
    doc.text(`Thanh toán: ${METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}`, lx, y);
    y += 4;
    doc.text(`Nhân viên: ${order.cashierName || 'Không xác định'}`, lx, y);

    y += 3;
    doc.line(lx, y, rx, y);

    // --- Items header ---
    y += 4;
    doc.setFont('NotoSans', 'bold');
    doc.text('Sản phẩm', lx, y);
    doc.text('SL', 52, y, { align: 'center' });
    doc.text('Thành tiền', rx, y, { align: 'right' });
    doc.setFont('NotoSans', 'normal');

    // --- Items ---
    for (const item of order.items) {
        y += 4;
        const effectivePrice = item.discountPrice ?? item.unitPrice;
        const lineTotal = effectivePrice * item.quantity;

        // Tên sản phẩm (wrap nếu dài)
        const nameLines = doc.splitTextToSize(item.name, 44) as string[];
        doc.text(nameLines, lx, y);
        const nameH = nameLines.length * 3.5;

        doc.text(`${item.unitPrice.toLocaleString()}đ`, lx, y + nameH);
        doc.text(`x${item.quantity}`, 52, y, { align: 'center' });
        doc.text(`${lineTotal.toLocaleString()}đ`, rx, y, { align: 'right' });

        if (item.discountPrice != null && item.discountPrice < item.unitPrice) {
            y += nameH + 3; // xuống thêm 1 dòng, tránh chồng lên dòng giá gốc ở y + nameH
            doc.setFontSize(7);
            const pct = Math.round((1 - item.discountPrice / item.unitPrice) * 100);
            doc.text(`(KM -${pct}%, giá: ${item.discountPrice.toLocaleString()}đ)`, lx + 2, y);
            doc.setFontSize(7.5);
        } else {
            y += nameH;
        }

        y += 1;
    }

    y += 2;
    doc.line(lx, y, rx, y);

    // --- Summary ---
    y += 4;
    doc.text('Tạm tính:', lx, y);
    doc.text(`${order.subtotal.toLocaleString()}đ`, rx, y, { align: 'right' });

    if (order.couponDiscount > 0 && order.coupon) {
        y += 4;
        doc.text(`Mã "${order.coupon.code}":`, lx, y);
        doc.text(`-${order.couponDiscount.toLocaleString()}đ`, rx, y, { align: 'right' });
    }

    y += 4;
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(9);
    doc.text('TỔNG CỘNG:', lx, y);
    doc.text(`${order.total.toLocaleString()}đ`, rx, y, { align: 'right' });

    y += 5;
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7.5);
    doc.line(lx, y, rx, y);
    y += 4;
    doc.text('Cảm ơn quý khách! Hẹn gặp lại.', mid, y, { align: 'center' });

    // KHÔNG resize pageSize.height ở đây.
    // Lý do: doc.text()/doc.line() tính toạ độ Y thật (PDF gốc ở dưới-trái)
    // ngay lúc gọi, dựa trên chiều cao trang LÚC ĐÓ (200mm theo format ban đầu).
    // Nếu đổi pageSize.height SAU khi đã vẽ xong nội dung, MediaBox xuất ra
    // sẽ nhỏ hơn nhiều so với toạ độ nội dung đã "đóng băng" trước đó
    // -> toàn bộ nội dung rơi ra ngoài khung trang mới -> PDF trống trắng.
    // Nếu thật sự cần PDF ngắn gọn theo nội dung, phải đo trước tổng chiều
    // cao nội dung rồi tạo `doc` với format đó NGAY TỪ ĐẦU (trước khi vẽ).

    doc.save(`hoadon_${order.orderCode}.pdf`);
}