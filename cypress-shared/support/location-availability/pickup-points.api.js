export default {
  getPickupPoints: (baseUrl) => {
    return `${baseUrl}/api/logistics/pvt/configuration/pickuppoints`
  },
  deletePickupPoint: (baseUrl, pickupPointid) => {
    return `${baseUrl}/api/logistics/pvt/configuration/pickuppoints/${pickupPointid}`
  },
}
