use wasm_bindgen::prelude::*;

/// Allocate a zeroed f32 buffer of `size` elements and return a raw pointer.
/// JS can then write into that buffer via `memory.buffer`.
#[wasm_bindgen]
pub fn allocate(size: usize) -> *mut f32 {
    let mut buffer = Vec::<f32>::with_capacity(size);
    unsafe {
        buffer.set_len(size);
    }
    let ptr = buffer.as_mut_ptr();
    std::mem::forget(buffer);
    ptr
}

/// Deallocate a buffer previously allocated with `allocate(ptr, size)`.
#[wasm_bindgen]
pub fn deallocate(ptr: *mut f32, size: usize) {
    unsafe {
        let _ = Vec::from_raw_parts(ptr, size, size);
    }
}

/// Average four input arrays (all of length `len`) and return a freshly
/// allocated output buffer (length `len`) whose pointer JS must later
/// free via `deallocate`.
#[wasm_bindgen]
pub fn average_four_arrays(
    ptr_a: *const f32,
    ptr_b: *const f32,
    ptr_c: *const f32,
    ptr_d: *const f32,
    len: usize
) -> *mut f32 {
    let a = unsafe { std::slice::from_raw_parts(ptr_a, len) };
    let b = unsafe { std::slice::from_raw_parts(ptr_b, len) };
    let c = unsafe { std::slice::from_raw_parts(ptr_c, len) };
    let d = unsafe { std::slice::from_raw_parts(ptr_d, len) };

    let mut out = Vec::<f32>::with_capacity(len);
    unsafe { out.set_len(len); }

    // Compute the average in-place.
    for i in 0..len {
        // out[i] is valid because of set_len
        out[i] = (a[i] + b[i] + c[i] + d[i]) * 0.25;
    }

    let ptr = out.as_mut_ptr();
    std::mem::forget(out);
    ptr
}
