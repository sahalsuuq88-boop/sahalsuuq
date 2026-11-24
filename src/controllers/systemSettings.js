import systemSettings from "../model/systemSettings.js";

// ==========================================
// GET STORE STATUS
// Customer + Admin
// ==========================================
export const getStoreStatus = async (req, res) => {
  try {
    let settings = await systemSettings.findOne();

    // Haddii settings aysan jirin, samee default
    if (!settings) {
      settings = await systemSettings.create({
        isStoreOpen: true,
        message: "",
        reason: "",
        closedUntil: null,
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get store status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get store status",
    });
  }
};

// ==========================================
// ADMIN UPDATE STORE STATUS
// Admin ONLY
// ==========================================
export const updateStoreStatus = async (req, res) => {
  try {
    const {
      isStoreOpen,
      message,
      reason,
      closedUntil,
    } = req.body;

    // IMPORTANT:
    // Waa systemSettings, ma aha SystemSettings
    let settings = await systemSettings.findOne();

    // Haddii uusan jirin, samee
    if (!settings) {
      settings = new systemSettings({
        isStoreOpen: true,
        message: "",
        reason: "",
        closedUntil: null,
      });
    }

    // Store Open / Closed
    if (typeof isStoreOpen === "boolean") {
      settings.isStoreOpen = isStoreOpen;
    }

    // Customer message
    if (typeof message === "string") {
      settings.message = message.trim();
    }

    // Closing reason
    if (typeof reason === "string") {
      settings.reason = reason.trim();
    }

    // Closed Until
    if (closedUntil !== undefined) {
      settings.closedUntil = closedUntil
        ? new Date(closedUntil)
        : null;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: settings.isStoreOpen
        ? "HEL SUUQ is now OPEN"
        : "HEL SUUQ is now CLOSED",
      settings,
    });
  } catch (error) {
    console.error("Update store status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store status",
      error: error.message,
    });
  }
};