// =====================================================
// DELIVERY CONFIG
// =====================================================

const DELIVERY_CONFIG = {
  // ===================================================
  // DISTANCE
  // ===================================================

  distance: {
    zone1: {
      maxKm: 3,
      fee: 1,
    },

    zone2: {
      maxKm: 6,
      fee: 2,
    },

    zone3: {
      fee: 3,
    },
  },

  // ===================================================
  // ORDER VALUE
  // ===================================================

  orderValue: {
    low: {
      max: 50,
      extraFee: 1,
    },

    medium: {
      max: 150,
      extraFee: 0,
    },

    high: {
      discount: true,

      zone1Fee: 0,
      zone2Fee: 0,
      zone3Fee: 1.5,
    },
  },
};

// =====================================================
// GET DISTANCE ZONE
// =====================================================

export const getDistanceZone = (distanceKm) => {
  const distance = Number(distanceKm);

  if (
    !Number.isFinite(distance) ||
    distance < 0
  ) {
    throw new Error("Invalid distance");
  }

  // Zone 1
  if (
    distance <=
    DELIVERY_CONFIG.distance.zone1.maxKm
  ) {
    return {
      zone: 1,
      name: "Near",
      fee:
        DELIVERY_CONFIG.distance.zone1.fee,
    };
  }

  // Zone 2
  if (
    distance <=
    DELIVERY_CONFIG.distance.zone2.maxKm
  ) {
    return {
      zone: 2,
      name: "Middle",
      fee:
        DELIVERY_CONFIG.distance.zone2.fee,
    };
  }

  // Zone 3
  return {
    zone: 3,
    name: "Far",
    fee:
      DELIVERY_CONFIG.distance.zone3.fee,
  };
};

// =====================================================
// GET ORDER VALUE TIER
// =====================================================

export const getOrderValueTier = (
  orderTotal
) => {
  const total = Number(orderTotal);

  if (
    !Number.isFinite(total) ||
    total < 0
  ) {
    throw new Error(
      "Invalid order total"
    );
  }

  // $0 - $50
  if (total <= 50) {
    return {
      tier: "low",
      name: "Standard",
      extraFee:
        DELIVERY_CONFIG.orderValue.low
          .extraFee,
      discount: false,
    };
  }

  // >$50 - $150
  if (total <= 150) {
    return {
      tier: "medium",
      name: "Medium",
      extraFee:
        DELIVERY_CONFIG.orderValue.medium
          .extraFee,
      discount: false,
    };
  }

  // >$150
  return {
    tier: "high",
    name: "Large",
    extraFee: 0,
    discount: true,
  };
};

// =====================================================
// CALCULATE DELIVERY FEE
// =====================================================

export const calculateDeliveryFee = ({
  distanceKm,
  orderTotal,
}) => {
  const distanceInfo =
    getDistanceZone(distanceKm);

  const orderValueInfo =
    getOrderValueTier(orderTotal);

  let deliveryFee = 0;

  // ===================================================
  // $0 - $50
  // ===================================================

  if (orderValueInfo.tier === "low") {
    deliveryFee =
      distanceInfo.fee + 1;
  }

  // ===================================================
  // >$50 - $150
  // ===================================================

  else if (
    orderValueInfo.tier === "medium"
  ) {
    deliveryFee =
      distanceInfo.fee;
  }

  // ===================================================
  // >$150
  // ===================================================

  else if (
    orderValueInfo.tier === "high"
  ) {
    if (distanceInfo.zone === 1) {
      deliveryFee = 0;
    }

    else if (
      distanceInfo.zone === 2
    ) {
      deliveryFee = 0;
    }

    else {
      deliveryFee = 1.5;
    }
  }

  return {
    distanceKm: Number(
      distanceKm
    ),

    distanceZone:
      distanceInfo.zone,

    distanceZoneName:
      distanceInfo.name,

    distanceFee:
      distanceInfo.fee,

    orderTotal:
      Number(orderTotal),

    orderValueTier:
      orderValueInfo.tier,

    orderValueTierName:
      orderValueInfo.name,

    orderValueExtraFee:
      orderValueInfo.extraFee,

    discountApplied:
      orderValueInfo.discount,

    deliveryFee:
      Number(
        deliveryFee.toFixed(2)
      ),
  };
};