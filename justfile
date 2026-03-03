set shell := ["zsh", "-cu"]

default:
  @just --list

install:
  pnpm install

dev:
  pnpm dev

build:
  pnpm -r build

test:
  pnpm -r test

lint:
  pnpm -r lint
