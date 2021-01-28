import { changeNetwork, initApp, logIn, logOut, onboardingComplete, verifyWallet } from './app';
import { IAppRepository } from '../../../domain/app/i-app-repository';
import { IWalletRepository } from '../../../domain/wallet/i-wallet-repository';
import { Network } from '../../../domain/app/value-objects';
import { BrowserStorageAppRepo } from '../../../infrastructure/app/browser/browser-storage-app-repository';
import { BrowserStorageWalletRepo } from '../../../infrastructure/wallet/browser/browser-storage-wallet-repository';
import { appInitialState, appReducer } from '../reducers';
import { mockThunkReducer } from '../reducers/mock-use-thunk-reducer';
import { testWallet } from '../../../../__test__/fixtures/test-wallet';
import {
  testAppDTO,
  testAppProps,
  testAppAuthenticatedDTO,
  testAppAuthenticatedProps,
  testAppNetworkLiquidDTO,
  testAppNetworkLiquidProps,
  testAppOnboardedDTO,
  testAppOnboardedProps,
  testAppWalletVerifiedDTO,
  testAppWalletVerifiedProps,
} from '../../../../__test__/fixtures/test-app';
import { onboardingInitState } from '../reducers/onboarding-reducer';

describe('App Actions', () => {
  let repos, store: ReturnType<typeof mockThunkReducer>;

  beforeAll(() => {
    repos = {
      app: new BrowserStorageAppRepo() as IAppRepository,
      wallet: new BrowserStorageWalletRepo() as IWalletRepository,
    };
    store = mockThunkReducer(appReducer, appInitialState, repos);
  });

  afterEach(() => {
    store.setState(appInitialState);
    store.clearActions();
  });

  test('Should init app', () => {
    const initAppAction = function () {
      return new Promise((resolve) => {
        store.dispatch(initApp(testAppProps));
        resolve(store.getState());
      });
    };

    return expect(initAppAction()).resolves.toStrictEqual({
      wallets: [],
      app: testAppProps,
      onboarding: onboardingInitState,
    });
  });

  test('Should update and persist wallet verification status', () => {
    // Repo update from testAppDTO to testAppWalletVerifiedDTO
    mockBrowser.storage.local.get.expect('app').andResolve({ app: testAppDTO });
    mockBrowser.storage.local.set.expect({ app: testAppWalletVerifiedDTO }).andResolve();

    const walletVerifyAction = function () {
      return new Promise((resolve, reject) => {
        return store.dispatch(
          verifyWallet(
            () => resolve(store.getState()),
            (err: Error) => reject(err.message)
          )
        );
      });
    };

    return expect(walletVerifyAction()).resolves.toStrictEqual({
      wallets: [],
      app: testAppWalletVerifiedProps,
      onboarding: onboardingInitState,
    });
  });

  test('Should update and persist onboarding status', () => {
    // Repo update from testAppDTO to testAppOnboardedDTO
    mockBrowser.storage.local.get.expect('app').andResolve({ app: testAppDTO });
    mockBrowser.storage.local.set.expect({ app: testAppOnboardedDTO }).andResolve();

    const onboardingCompleteAction = function () {
      return new Promise((resolve, reject) => {
        return store.dispatch(
          onboardingComplete(
            () => resolve(store.getState()),
            (err: Error) => reject(err.message)
          )
        );
      });
    };

    return expect(onboardingCompleteAction()).resolves.toStrictEqual({
      wallets: [],
      app: testAppOnboardedProps,
      onboarding: onboardingInitState,
    });
  });

  test('Should log in when valid password', () => {
    // Repo update from testAppDTO to testAppAuthenticatedDTO
    mockBrowser.storage.local.get.expect('app').andResolve({ app: testAppDTO });
    mockBrowser.storage.local.set.expect({ app: testAppAuthenticatedDTO }).andResolve();

    store.setState({
      wallets: [testWallet],
      app: testAppProps,
      onboarding: onboardingInitState,
    });

    const logInAction = function () {
      return new Promise((resolve, reject) => {
        return store.dispatch(
          logIn(
            'testpassword',
            () => resolve(store.getState()),
            (err: Error) => reject(err.message)
          )
        );
      });
    };

    return expect(logInAction()).resolves.toStrictEqual({
      wallets: [testWallet],
      app: testAppAuthenticatedProps,
      onboarding: onboardingInitState,
    });
  });

  test('Should not log in when invalid password', () => {
    store.setState({
      wallets: [testWallet],
      app: testAppProps,
    });

    const logInAction = function () {
      return new Promise((resolve, reject) => {
        return store.dispatch(
          logIn(
            'wrongpassword',
            () => resolve(store.getState()),
            (err: Error) => reject(err.message)
          )
        );
      });
    };

    return expect(logInAction()).rejects.toEqual('Invalid password');
  });

  test('Should log out', () => {
    // Repo update from testAppAuthenticatedDTO to testAppDTO
    mockBrowser.storage.local.get.expect('app').andResolve({ app: testAppAuthenticatedDTO });
    mockBrowser.storage.local.set.expect({ app: testAppDTO }).andResolve();

    const logOutAction = function () {
      return new Promise((resolve, reject) => {
        return store.dispatch(
          logOut(
            () => resolve(store.getState()),
            (err: Error) => reject(err.message)
          )
        );
      });
    };

    return expect(logOutAction()).resolves.toStrictEqual({
      wallets: [],
      app: testAppProps,
      onboarding: onboardingInitState,
    });
  });

  test('Should change network', () => {
    // Repo update from regtest to liquid
    mockBrowser.storage.local.get.expect('app').andResolve({ app: testAppDTO });
    mockBrowser.storage.local.set.expect({ app: testAppNetworkLiquidDTO }).andResolve();

    const changeNetworkAction = function () {
      return new Promise((resolve, reject) => {
        return store.dispatch(
          changeNetwork(
            Network.create('liquid'),
            () => resolve(store.getState()),
            (err: Error) => reject(err.message)
          )
        );
      });
    };

    return expect(changeNetworkAction()).resolves.toStrictEqual({
      wallets: [],
      app: testAppNetworkLiquidProps,
      onboarding: onboardingInitState,
    });
  });
});