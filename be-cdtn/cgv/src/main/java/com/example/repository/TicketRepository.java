package com.example.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.entity.Tickets;

@Repository
public interface TicketRepository extends JpaRepository<Tickets, Integer>, JpaSpecificationExecutor<Tickets>{

    // Tìm vé theo mã vé (dùng trong VNPay callback)
    Tickets findByTicketsCode(String ticketsCode);

    // Tìm vé UNPAID + PENDING đã tạo quá thời gian cho phép (để scheduler auto-cancel)
    @Query("SELECT t FROM Tickets t WHERE t.paymentStatus = com.example.entity.Tickets.PaymentStatus.UNPAID " +
           "AND t.status = com.example.entity.Tickets.Status.PENDING " +
           "AND t.ticketsDate < :expiredTime " +
           "AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Tickets> findExpiredUnpaidTickets(@Param("expiredTime") Date expiredTime);
}

