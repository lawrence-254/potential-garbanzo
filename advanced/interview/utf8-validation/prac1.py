from math import ceil, log
def n_bits_required(nvalues: int) -> int:
    return ceil(log(nvalues) / log(2))

print(n_bits_required(256))