#!/usr/bin/env python3
class BankAccount:
    def __init__(self, acc_no):
        self.acc_no = acc_no
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount

    def _withdraw(self, amount):
        floated_balance = self.balance-5
        if amount < floated_balance:
            self.balance -= amount
        else:
            print(f'your balance of {self.balance} is too low to withdraw {amount}')

    def _show_balance(self):
        print(f'Your account of {self.acc_no} has a balance of: ')
        print(f'{self.balance} dollars')

class SavingsAccount(BankAccount):
    def __init__(self, acc_no, interest_rate):
        super().__init__(acc_no)
        self.interest_rate = interest_rate

    def calc_interest(self):
        interest = self.balance * self.interest_rate
        self.balance+=interest



jane = BankAccount(2)
jane._show_balance()
jane.deposit(500)
jane._show_balance()
jane._withdraw(500)
jane._show_balance()
jane.deposit(1500)
jane._show_balance()
jane._withdraw(600)
jane._show_balance()

print('/////////////////////////john\'s account////////////////////////')
john = SavingsAccount(2, 0.5)
john._show_balance()
john.deposit(506)
john._show_balance()
john._withdraw(500)
john._show_balance()
john.deposit(1500)
john._show_balance()
john._withdraw(600)
john._show_balance()
john.calc_interest()
john._show_balance()
