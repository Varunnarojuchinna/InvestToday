export const SourceType = {
    CREATE_USER_GOOGLE_SIGN_IN: 1,
    CREATE_USER_SIGN_UP_LOGIN_IN: 2
  };

  export const TrickMode = {
    CYCLE: 1,
    ONESHOT: 2
  };

  export const ErrorMessages = {
    EMAIL_REQUIRED:"Email is required",
    EMAIL_INVALID:"Email address is invalid",
    NAME_REQUIRED:"Name is required",
    NAME_INVALID:"Name cannot be purely numeric",
    PHONE_NUMBER_REQUIRED:"Phone number is required",
    PHONE_NUMBER_INVALID:"Invalid phone number, must be 10 digits",
    ACCEPT_TERMS_AND_CONDITIONS:"You must accept the terms and conditions",
    PASSWORD_DOES_NOT_MATCH:"Password does not match",
    PASSWORD_REQUIRED:"Password is required",
    OTP_INVALID:"The OTP is invalid",
    EMAIL_NOT_REGISTERED:"Enter Registered User email",
    PHONE_NUMBER_NOT_REGISTERED:"Enter Registered User PhoneNumber",
    EMAIL_OR_PHONE_NUMBER_REQUIRED:"Email/PhoneNumber is required",
    EMAIL_OR_PHONE_NUMBER_INVALID:"Email/PhoneNumber is invalid"
  }

  export const InfoMessages = {
    REGISTRATION_SUCCESSFUL_MESSAGE:"User registration is successful and an email is sent to your email address",
    WILL_SEND_YOU_CONFIRMATION_MAIL:"We will send you an confirmation mail along with your password"
  }

  export const BrokerTypes = {
    ALICE_BLUE: 1,
    ANGEL_ONE: 2,
    TEST_BROKER: 10
  };

  export const NotificationCategory = {
    ALL_USERS: 1,
    SUBSCRIPTION_USERS: 2,
  };
