interface User {
  username: string;
  password: string;
}

interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

interface TestData {
  users: {
    standard_user: User;
    locked_out_user: User;
    invalid_user: User;
  };
  checkout: {
    valid: CheckoutInfo;
    invalid: CheckoutInfo;
  };
}

const testData: TestData = {
  users: {
    standard_user: { username: 'standard_user', password: 'secret_sauce' },
    locked_out_user: { username: 'locked_out_user', password: 'secret_sauce' },
    invalid_user: { username: 'bad_user', password: 'bad_pass' }
  },
  checkout: {
    valid: { firstName: 'John', lastName: 'Doe', postalCode: '12345' },
    invalid: { firstName: '', lastName: '', postalCode: '' }
  }
};

export const { users, checkout } = testData;
export default testData;