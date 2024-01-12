#!/usr/bin/env python3
class Solution:
    def halvesAreAlike(self, s: str) -> bool:
        mid = (len(s))//2
        firstHalf = s[:mid].lower()
        secondHalf = s[mid:].lower()
        vowel = set("aeiou")
        def check(vow):
            count = 0
            for c in vow:
                if c in vowel:
                    count += 1
            return count
        comp = check(firstHalf) == check(secondHalf)
        return comp


solution_instance = Solution()
result = solution_instance.halvesAreAlike('booook')
print(result)