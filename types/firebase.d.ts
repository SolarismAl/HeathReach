declare module 'firebase/auth' {
  export interface UserInfo {
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
  }

  export interface User {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    providerId: string;
    refreshToken: string;
    tenantId: string | null;
    providerData: UserInfo[];
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
    delete(): Promise<void>;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
    reload(): Promise<void>;
    toJSON(): object;
  }

  export interface IdTokenResult {
    token: string;
    expirationTime: string;
    authTime: string;
    issuedAtTime: string;
    signInProvider: string | null;
    signInSecondFactor: string | null;
    claims: { [key: string]: any };
  }

  export interface Auth {
    app: any;
    currentUser: User | null;
    languageCode: string | null;
    settings: AuthSettings;
    tenantId: string | null;
    onAuthStateChanged(nextOrObserver: (user: User | null) => void): () => void;
    onIdTokenChanged(nextOrObserver: (user: User | null) => void): () => void;
    signOut(): Promise<void>;
    useDeviceLanguage(): void;
  }

  export interface AuthSettings {
    appVerificationDisabledForTesting: boolean;
  }

  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: string;
  }

  export interface AuthError extends Error {
    code: string;
    message: string;
    customData?: any;
  }

  export interface GoogleAuthProvider {
    providerId: string;
    credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
    setCustomParameters(customOAuthParameters: Record<string, string>): GoogleAuthProvider;
    addScope(scope: string): GoogleAuthProvider;
  }

  export interface AuthCredential {
    providerId: string;
    signInMethod: string;
  }

  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithCredential(auth: Auth, credential: AuthCredential): Promise<UserCredential>;
  export function signInWithPopup(auth: Auth, provider: any): Promise<UserCredential>;
  export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void): () => void;

  export const GoogleAuthProvider: {
    new (): GoogleAuthProvider;
    PROVIDER_ID: string;
    GOOGLE_SIGN_IN_METHOD: string;
    credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
  } & GoogleAuthProvider;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    app: any;
    toJSON(): object;
  }

  export interface DocumentReference<T = any> {
    id: string;
    path: string;
    parent: CollectionReference<T>;
    firestore: Firestore;
    get(): Promise<DocumentSnapshot<T>>;
    set(data: T): Promise<void>;
    update(data: Partial<T>): Promise<void>;
    delete(): Promise<void>;
    onSnapshot(observer: (snapshot: DocumentSnapshot<T>) => void): () => void;
  }

  export interface DocumentSnapshot<T = any> {
    id: string;
    ref: DocumentReference<T>;
    exists(): boolean;
    data(): T | undefined;
    get(fieldPath: string): any;
  }

  export interface CollectionReference<T = any> {
    id: string;
    path: string;
    parent: DocumentReference | null;
    firestore: Firestore;
    doc(documentPath?: string): DocumentReference<T>;
    add(data: T): Promise<DocumentReference<T>>;
    get(): Promise<QuerySnapshot<T>>;
    where(fieldPath: string, opStr: WhereFilterOp, value: any): Query<T>;
    orderBy(fieldPath: string, directionStr?: OrderByDirection): Query<T>;
    limit(limit: number): Query<T>;
    onSnapshot(observer: (snapshot: QuerySnapshot<T>) => void): () => void;
  }

  export interface Query<T = any> {
    firestore: Firestore;
    get(): Promise<QuerySnapshot<T>>;
    where(fieldPath: string, opStr: WhereFilterOp, value: any): Query<T>;
    orderBy(fieldPath: string, directionStr?: OrderByDirection): Query<T>;
    limit(limit: number): Query<T>;
    onSnapshot(observer: (snapshot: QuerySnapshot<T>) => void): () => void;
  }

  export interface QuerySnapshot<T = any> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }

  export interface QueryDocumentSnapshot<T = any> extends DocumentSnapshot<T> {
    data(): T;
  }

  export type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
  export type OrderByDirection = 'desc' | 'asc';

  export interface Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
  }

  export function getFirestore(app?: any): Firestore;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): CollectionReference;
  export function getDoc<T>(reference: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  export function setDoc<T>(reference: DocumentReference<T>, data: T): Promise<void>;
  export function updateDoc<T>(reference: DocumentReference<T>, data: Partial<T>): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function addDoc<T>(reference: CollectionReference<T>, data: T): Promise<DocumentReference<T>>;
  export function getDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>>;
  export function query<T>(query: Query<T>, ...constraints: any[]): Query<T>;
  export function where(fieldPath: string, opStr: WhereFilterOp, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: OrderByDirection): any;
  export function limit(limit: number): any;
  export function serverTimestamp(): any;
  export function Timestamp(seconds: number, nanoseconds: number): Timestamp;
  export function onSnapshot<T>(reference: DocumentReference<T> | Query<T>, observer: (snapshot: DocumentSnapshot<T> | QuerySnapshot<T>) => void): () => void;
}

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
    automaticDataCollectionEnabled: boolean;
  }

  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function deleteApp(app: FirebaseApp): Promise<void>;
}
