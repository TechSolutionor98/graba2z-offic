// The physical stores a customer can collect from. Shared rather than declared
// per page: the storefront checkout and the admin Create Order/Quotation screen
// both offer collection, and a store added in one place has to appear in the
// other.
//
// `visible: false` keeps a store on file (so older orders still resolve its name
// and address) while hiding it from the pickers.
export const STORES = [
  {
    storeId: "1",
    name: "CROWN EXCEL (Experience Center)",
    address:
      "Admiral Plaza Hotel Building - 37C Street - Shop 5 - Khalid Bin Al Waleed Rd - Bur Dubai - Dubai - United Arab Emirates",
    phone: "+97143540566",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7234567890123!2d55.28877!3d25.2603139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ba6913e913%3A0x904de2fef7d413ec!2sCROWN%20EXCEL%20(Experience%20Center)!5e0!3m2!1sen!2sae!4v1640995200000!5m2!1sen!2sae",
    coordinates: { lat: 25.2603093, lng: 55.2912192 },
    visible: true,
  },
  {
    storeId: "2",
    name: "Crown Excel Head Office",
    address:
      "Al Jahra Building, 2nd floor, office 204, 18th st- Al Raffa - Khalid Bin Al Waleed Rd - Bur Dubai - Dubai - United Arab Emirates",
    phone: "+97143540566",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7234567890123!2d55.28877!3d25.2603139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ba6913e913%3A0x904de2fef7d413ec!2sCrown%20Excel%20Head%20Office!5e0!3m2!1sen!2sae!4v1640995200001!5m2!1sen!2sae",
    coordinates: { lat: 25.2603093, lng: 55.2912192 },
    visible: false,
  },
  {
    storeId: "3",
    name: "CROWN EXCEL (branch 2)",
    address:
      "Shop No. 2 - Building 716 Khalid Bin Al Waleed Rd - opposite Main Entrance of Admiral Plaza Hotel - Bur Dubai - Al Souq Al Kabeer - Dubai - United Arab Emirates",
    phone: "+97143281653",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7456789012345!2d55.2889495!3d25.2601883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43326d8e4cc9%3A0x4d452917e7a19b6!2sCROWN%20EXCEL%20(branch%202)!5e0!3m2!1sen!2sae!4v1640995200002!5m2!1sen!2sae",
    coordinates: { lat: 25.2601835, lng: 55.2915244 },
    visible: true,
  },
  {
    storeId: "4",
    name: "GrabAtoZ",
    address:
      "Al Jahra Building, 2nd floor, 18th st - Khalid Bin Al Waleed Rd - Al Raffa - Dubai - United Arab Emirates",
    phone: "+97143395794",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.8901234567890!2d55.2880084!3d25.2589614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43591325fc3b%3A0x62b01661f2a6cdb7!2sGrabAtoZ!5e0!3m2!1sen!2sae!4v1640995200003!5m2!1sen!2sae",
    coordinates: { lat: 25.2589566, lng: 55.2905833 },
    visible: false,
  },
]

export const visibleStores = () => STORES.filter((store) => store.visible !== false)

export const findStore = (storeId) => STORES.find((store) => store.storeId === storeId) || null

export default STORES
