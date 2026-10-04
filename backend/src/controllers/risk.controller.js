import mongoose from "mongoose";
import { evaluateRisk } from "../services/risk.service.js";

export async function getMyRisk(req, res, next) {
  try {
    const { dropId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(dropId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid drop ID"
        }
      });
    }

    const risk = await evaluateRisk(req.user.id, dropId);

    return res.status(200).json({
      success: true,
      data: {
        userId: req.user.id,
        dropId,
        ...risk
      },
      message: "Risk information fetched successfully"
    });
  } catch (error) {
    next(error);
  }
}
