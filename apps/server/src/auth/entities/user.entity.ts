export class User {
  id: string;
  address: string;
  country: string;
  createdAt: Date;
  email: string;
  firstName: string;
  identification: string;
  lastName: string;
  phone: string;
  saveEscrow: boolean;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
