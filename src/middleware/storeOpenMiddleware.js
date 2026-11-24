import systemSettings from "../model/systemSettings.js";


export const storeOpenMiddleware = async (req, res, next) => {
  try {
    let settings = await systemSettings.findOne();

    // Haddii settings aysan jirin,
    // store-ka default ahaan waa OPEN
    if (!settings) {
      settings = await systemSettings.create({
        isStoreOpen: true,
      });
    }

    // Haddii store-ku xiran yahay
    if (!settings.isStoreOpen) {
      return res.status(403).json({
        success: false,
        storeClosed: true,
        message:
          settings.message ||
          "HEL SUUQ is currently closed. Please come back later.",
        reason: settings.reason || "",
        closedUntil: settings.closedUntil || null,
      });
    }

    next();
  } catch (error) {
    console.error("Store open middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check store status",
    });
  }
};

