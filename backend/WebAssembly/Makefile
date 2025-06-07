# Makefile for compiling average.c into WebAssembly

# Compiler
EMCC = emcc

# Input/output
SRC = average.c
OUT = average
JS_TARGET = $(OUT).js
WASM_TARGET = $(OUT).wasm

# Emscripten flags
EMCC_FLAGS = \
  -O3 \
  -s MODULARIZE=1 \
  -s ENVIRONMENT="web" \
  -s EXPORTED_FUNCTIONS='["_average_four_arrays_malloc", "_wasm_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap", "allocate", "ALLOC_NORMAL", "getValue", "setValue"]'

# Default target
all: $(JS_TARGET)

# Build target
$(JS_TARGET): $(SRC)
	$(EMCC) $(SRC) -o $(JS_TARGET) $(EMCC_FLAGS)

# Clean target
clean:
	rm -f $(JS_TARGET) $(WASM_TARGET) $(OUT).html

.PHONY: all clean
