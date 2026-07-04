import {
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'
import Image from 'next/image'
import React, { type JSX } from 'react'

export type SerializedImageNode = Spread<
  { altText: string; src: string; type: 'image'; version: 1 },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string

  static getType() {
    return 'image'
  }
  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__altText, node.__key)
  }
  static importJSON(node: SerializedImageNode) {
    return new ImageNode(node.src, node.altText)
  }

  constructor(src: string, altText = '', key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
  }

  createDOM() {
    return document.createElement('div')
  }
  updateDOM() {
    return false
  }
  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
    }
  }
  decorate() {
    return (
      <Image
        unoptimized
        width={1600}
        height={900}
        className="lexical-image"
        src={this.__src}
        alt={this.__altText}
      />
    )
  }
  isInline() {
    return false
  }
}

export function $createImageNode({ src, altText = '' }: { src: string; altText?: string }) {
  return new ImageNode(src, altText)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
