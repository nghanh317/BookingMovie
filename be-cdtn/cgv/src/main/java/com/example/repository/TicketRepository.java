package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Tickets;

@Repository
public interface TicketRepository extends JpaRepository<Tickets, Integer>, JpaSpecificationExecutor<Tickets>{
	
Tickets findByTicketsCode (String ticketsCode);

}
