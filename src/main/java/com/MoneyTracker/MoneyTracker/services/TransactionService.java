package com.MoneyTracker.MoneyTracker.services;

import com.MoneyTracker.MoneyTracker.models.Transaction;
import com.MoneyTracker.MoneyTracker.models.User;
import com.MoneyTracker.MoneyTracker.models.DTOs.SubmitTransactionDTO;
import com.MoneyTracker.MoneyTracker.repositories.TransactionRepository;
import com.MoneyTracker.MoneyTracker.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public SubmitTransactionDTO createTransaction(SubmitTransactionDTO transactionDTO) {
        User user = userRepository.findById(transactionDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + transactionDTO.getUserId() + " not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setTransactionDate(transactionDTO.getTransactionDate());
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setIncome(transactionDTO.getIsIncome());
        transaction.setCategory(transactionDTO.getCategory());

        Transaction savedTransaction = transactionRepository.save(transaction);

        return SubmitTransactionDTO.toTransactionDTO(savedTransaction);
    }

    public SubmitTransactionDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction with ID " + id + " not found"));
        return SubmitTransactionDTO.toTransactionDTO(transaction);
    }

    public List<SubmitTransactionDTO> getTransactionsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));
        return transactionRepository.findByUser(user)
                .stream()
                .map(transaction -> SubmitTransactionDTO.toTransactionDTO(transaction))
                .collect(Collectors.toList());
    }

    public List<SubmitTransactionDTO> getTransactionsByUserIdAndMonth(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        return transactionRepository.findByUserAndTransactionDateBetween(user, startDate, endDate)
                .stream()
                .map(SubmitTransactionDTO::toTransactionDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Double> getMonthlySpendingByCategory(Long userId, int year, int month) {
        User user = userRepository.findById((long) userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID not found"));
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        return transactionRepository.findByUserAndTransactionDateBetween(user, startDate, endDate)
                .stream()
                .filter(transaction -> !transaction.isIncome()) // Only include expenses
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }

    public Double getMonthlyIncome(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        return transactionRepository.findByUserAndTransactionDateBetween(user, startDate, endDate)
                .stream()
                .filter(Transaction::isIncome) // Only include income
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    public SubmitTransactionDTO updateTransaction(Long id, SubmitTransactionDTO transactionDTO) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction with ID " + id + " not found"));

        User user = userRepository.findById(transactionDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + transactionDTO.getUserId() + " not found"));

        transaction.setUser(user);
        transaction.setTransactionDate(transactionDTO.getTransactionDate());
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setIncome(transactionDTO.getIsIncome());
        transaction.setCategory(transactionDTO.getCategory());

        Transaction updatedTransaction = transactionRepository.save(transaction);

        return SubmitTransactionDTO.toTransactionDTO(updatedTransaction);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction with ID " + id + " not found");
        }
        transactionRepository.deleteById(id);
    }
}