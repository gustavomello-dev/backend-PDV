import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const queue = asyncHandler(async (_req, res) => {
    const orders = await Order.find({ status: { $in: ["SENT", "PREPARING"] } })
        .populate("table", "number")
        .sort({ sentAt: 1 });

    res.json(orders);
});

export const updateStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
    }

    if (!["SENT", "PREPARING"].includes(order.status)) {
        return res
            .status(400)
            .json({ message: "Pedido não está na fila da cozinha" });
    }

    order.status = req.body.status === "READY" ? "READY" : "PREPARING";
    if (order.status === "READY") order.readyAt = new Date();

    await order.save();
    res.json(order);
});
