//
//  RNAutomotive-Bridging-Header.h
//
//  Imports Objective-C declarations into the Swift compilation unit.
//  Required because Swift code in this pod references React Native and
//  CarPlay APIs that are exposed as Objective-C headers.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTLog.h>
#import <CarPlay/CarPlay.h>

// Legacy Obj-C module — Swift code (scene delegate, future template
// builders) calls back into this during the Obj-C → Swift migration.
// When RNCarPlay.m is fully rewritten in Swift (Step 6), this import
// can be dropped.
#import "RNCarPlay.h"
