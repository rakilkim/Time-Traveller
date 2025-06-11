#include <stdlib.h>
#include <stdint.h>

float* average_four_arrays_malloc(const float* a, const float* b, const float* c, const float* d, int32_t n) {
    float* out = (float*)malloc(n * sizeof(float));
    for (int32_t i = 0; i < n; i++) {
        out[i] = (a[i] + b[i] + c[i] + d[i]) / 4.0f;
    }
    return out;
}

void wasm_free(void* ptr){
    free(ptr);
}