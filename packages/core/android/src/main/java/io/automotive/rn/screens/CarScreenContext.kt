package io.automotive.rn.screens

import io.automotive.rn.utils.EventEmitter
import java.util.WeakHashMap

data class CarScreenContext(
  val screenMarker: String,
  var eventEmitter: EventEmitter,
  var screens: WeakHashMap<String, CarScreen>
)
