package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;


import com.example.entity.TicketsDetails;

@Repository
public interface TicketDetailRepository extends JpaRepository<TicketsDetails, Integer>, JpaSpecificationExecutor<TicketsDetails>{
	List<TicketsDetails> findByTickets_Id(Integer ticketId);
}
