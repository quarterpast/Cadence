SHELL := /bin/bash
export PATH := $(shell npm bin):$(PATH)

SJS_OPTS = -m sparkler/macros -r

all: lib/index.js

lib/%.js: src/%.js
	sjs $(SJS_OPTS) -o $@ $<