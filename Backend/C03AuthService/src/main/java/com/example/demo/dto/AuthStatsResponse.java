package com.example.demo.dto;

public class AuthStatsResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalVendors;
    private long totalAdmins;

    public AuthStatsResponse() {
    }

    public AuthStatsResponse(long totalUsers, long totalCustomers, long totalVendors, long totalAdmins) {
        this.totalUsers = totalUsers;
        this.totalCustomers = totalCustomers;
        this.totalVendors = totalVendors;
        this.totalAdmins = totalAdmins;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(long totalVendors) {
        this.totalVendors = totalVendors;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }
}
