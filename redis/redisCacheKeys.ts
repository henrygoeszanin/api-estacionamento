export const CACHE_KEYS = {
  ALL_CARS: 'allCars',
  ALL_USERS: 'allUsers',
  MY_CARS: (userId: string) => `myCars-${userId}`,
  CAR: (carId: string) => `car-${carId}`,
  USER: (userId: string) => `user-${userId}`,
};
