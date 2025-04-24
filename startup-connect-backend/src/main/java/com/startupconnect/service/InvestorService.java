package com.startupconnect.service;

import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.User;
import com.startupconnect.dto.InvestorDetailsDTO;
import com.startupconnect.repository.InvestorProfileRepository;
import com.startupconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvestorService {

    @Autowired
    private InvestorProfileRepository investorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    public List<InvestorDetailsDTO> getAllInvestorsWithDetails() {
        return investorProfileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InvestorDetailsDTO getInvestorDetailsById(Long id) {
        InvestorProfile investor = investorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investor not found with id: " + id));
        return convertToDTO(investor);
    }

    private InvestorDetailsDTO convertToDTO(InvestorProfile investor) {
        User user = investor.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for investor with id: " + investor.getId());
        }

        InvestorDetailsDTO dto = new InvestorDetailsDTO();
        dto.setId(investor.getId());
        dto.setCompanyName(investor.getCompanyName());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setSector(investor.getSector());
        dto.setInvestmentFocus(investor.getInvestmentFocus());
        dto.setLocation(investor.getLocation());
        dto.setDescription(investor.getDescription());
        dto.setInvestmentRangeMin(investor.getInvestmentRangeMin());
        dto.setInvestmentRangeMax(investor.getInvestmentRangeMax());
        dto.setUserId(user.getId());

        return dto;
    }
} 