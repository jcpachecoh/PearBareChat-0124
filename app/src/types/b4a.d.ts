declare module 'b4a' {
  function toString(buf: Uint8Array, encoding?: string): string
  function from(str: string, encoding?: string): Uint8Array
  export { toString, from }
}
