SHELL := /bin/bash
export PATH := $(shell npm bin):$(PATH)

SJS_OPTS = -m sparkler/macros -r
JS_SRC = $(wildcard src/*.js)
JS_LIB = $(patsubst src/%.js,lib/%.js,$(JS_SRC))

all: $(JS_LIB)

lib/cli.js: src/cli.js
	@mkdir -p ${@D}
	cp $< $@

lib/%.js: src/%.js
	@mkdir -p ${@D}
	sjs $(SJS_OPTS) -o $@ $<
	@echo $@ done

test: all test.js
	mocha