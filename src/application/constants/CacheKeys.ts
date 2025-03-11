export class CacheKeys {
  static readonly ALL_CARS = 'allCars';
  static readonly CAR = (id: string) => `car-${id}`;
  static readonly MY_CARS = (userId: string) => `myCars-${userId}`;
  static readonly USER = (userId: string) => `user-${userId}`;
  static readonly ALL_USERS = 'allUsers';
}