import type { OrderPayment as PrismaOrderPayment, Prisma } from "@prisma/client";
import { DiscountRate } from "../../../../shared/domain/value-objects/DiscountRate.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { OrderPaymentReadModel } from "../../application/repositories/OrderPaymentRepository.js";
import { OrderPayment } from "../../domain/entities/OrderPayment.js";
import { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

export class OrderPaymentMapper {
  static toDomain(record: PrismaOrderPayment): OrderPayment {
    return OrderPayment.restore(
      {
        orderId: record.orderId,
        organizationId: record.organizationId,
        totalPaid: MoneyInCents.create(record.totalPaidInCents),
        discount: record.discount === null ? null : DiscountRate.create(record.discount.toNumber()),
        paymentMethod: record.paymentMethod as PaymentMethod,
        status: record.status as PaymentStatus,
        externalPaymentId: record.externalPaymentId,
        checkoutUrl: record.checkoutUrl,
        pixQrCode: record.pixQrCode,
        pixQrCodeBase64: record.pixQrCodeBase64,
        expiresAt: record.expiresAt,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaOrderPayment): OrderPaymentReadModel {
    return {
      id: record.id,
      orderId: record.orderId,
      organizationId: record.organizationId,
      totalPaidInCents: record.totalPaidInCents,
      discount: record.discount === null ? null : record.discount.toNumber(),
      paymentMethod: record.paymentMethod as PaymentMethod,
      status: record.status as PaymentStatus,
      externalPaymentId: record.externalPaymentId,
      checkoutUrl: record.checkoutUrl,
      pixQrCode: record.pixQrCode,
      pixQrCodeBase64: record.pixQrCodeBase64,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(payment: OrderPayment): Prisma.OrderPaymentUncheckedCreateInput {
    return {
      id: payment.id,
      orderId: payment.orderId,
      organizationId: payment.organizationId,
      totalPaidInCents: payment.totalPaidInCents,
      discount: payment.discountValue,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      externalPaymentId: payment.externalPaymentId,
      checkoutUrl: payment.checkoutUrl,
      pixQrCode: payment.pixQrCode,
      pixQrCodeBase64: payment.pixQrCodeBase64,
      expiresAt: payment.expiresAt,
    };
  }

  static toUpdatePersistence(payment: OrderPayment): Prisma.OrderPaymentUncheckedUpdateInput {
    return {
      status: payment.status,
      externalPaymentId: payment.externalPaymentId,
      checkoutUrl: payment.checkoutUrl,
      pixQrCode: payment.pixQrCode,
      pixQrCodeBase64: payment.pixQrCodeBase64,
      expiresAt: payment.expiresAt,
    };
  }
}
