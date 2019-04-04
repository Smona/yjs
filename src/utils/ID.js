/**
 * @module utils
 */

import { AbstractType } from '../internals' // eslint-disable-line

import * as decoding from 'lib0/decoding.js'
import * as encoding from 'lib0/encoding.js'
import * as error from 'lib0/error.js'

export class ID {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor (client, clock) {
    /**
     * @type {number} Client id
     */
    this.client = client
    /**
     * @type {number} unique per client id, continuous number
     */
    this.clock = clock
  }
  /**
   * @return {ID}
   */
  clone () {
    return new ID(this.client, this.clock)
  }
  /**
   * @param {ID} id
   * @return {boolean}
   */
  equals (id) {
    return id !== null && id.client === this.client && id.clock === this.clock
  }
  /**
   * @param {ID} id
   * @return {boolean}
   */
  lessThan (id) {
    if (id.constructor === ID) {
      return this.client < id.client || (this.client === id.client && this.clock < id.clock)
    } else {
      return false
    }
  }
}

/**
 * @param {ID} a
 * @param {ID} b
 * @return {boolean}
 */
export const compareIDs = (a, b) => a === b || (a !== null && b !== null && a.client === b.client && a.clock === b.clock)

/**
 * @param {number} client
 * @param {number} clock
 */
export const createID = (client, clock) => new ID(client, clock)

/**
 * @param {encoding.Encoder} encoder
 * @param {ID} id
 */
export const writeID = (encoder, id) => {
  encoding.writeVarUint(encoder, id.client)
  encoding.writeVarUint(encoder, id.clock)
}

/**
 * Read ID.
 * * If first varUint read is 0xFFFFFF a RootID is returned.
 * * Otherwise an ID is returned
 *
 * @param {decoding.Decoder} decoder
 * @return {ID}
 */
export const readID = decoder =>
  createID(decoding.readVarUint(decoder), decoding.readVarUint(decoder))

/**
 * The top types are mapped from y.share.get(keyname) => type.
 * `type` does not store any information about the `keyname`.
 * This function finds the correct `keyname` for `type` and throws otherwise.
 *
 * @param {AbstractType<any>} type
 * @return {string}
 */
export const findRootTypeKey = type => {
  // @ts-ignore _y must be defined, otherwise unexpected case
  for (let [key, value] of type._y.share) {
    if (value === type) {
      return key
    }
  }
  throw error.unexpectedCase()
}