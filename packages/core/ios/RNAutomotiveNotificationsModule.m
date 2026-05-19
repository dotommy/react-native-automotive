//
//  RNAutomotiveNotificationsModule.m
//
//  Obj-C bridge declarations that register the Swift-implemented
//  `AutomotiveNotifications` module with React Native. The actual
//  behaviour lives in `RNAutomotiveNotificationsModule.swift`.
//
//  RCT_EXTERN_MODULE wires the class name visible to JS
//  (`NativeModules.AutomotiveNotifications`) to the Swift class
//  (`NotificationsModule` — exposed to Obj-C as `AutomotiveNotifications`
//  via its `@objc(AutomotiveNotifications)` annotation).
//
//  RCT_EXTERN_METHOD declares each method's Obj-C selector so the RN
//  bridge can invoke it. Swift can't emit these macros itself.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AutomotiveNotifications, RCTEventEmitter)

RCT_EXTERN_METHOD(send:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
