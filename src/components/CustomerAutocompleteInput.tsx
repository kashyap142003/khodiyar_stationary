import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Search, History, Check } from 'lucide-react';
import { Customer } from '../types';
import { StorageService } from '../services/storage';
import { calculateCustomerFinancials } from '../services/businessLogic';
import { formatINR } from '../lib/money';

interface Props {
  customerName: string;
  onChangeName: (name: string) => void;
  customerPhone?: string;
  onChangePhone?: (phone: string) => void;
  onSelectCustomer?: (customer: Customer) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const CustomerAutocompleteInput: React.FC<Props> = ({
  customerName,
  onChangeName,
  customerPhone = '',
  onChangePhone,
  onSelectCustomer,
  label = 'Customer Name',
  placeholder = 'Type customer name (e.g. Rajesh Patel / Sardar High School)',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const customers = StorageService.getCustomers().filter(c => !c.isArchived);
  const sales = StorageService.getSales();
  const payments = StorageService.getCustomerPayments();
  const adjustments = StorageService.getCustomerAdjustments();

  // Filter matching customers from history
  const filteredCustomers = customers.filter(c => {
    if (!customerName.trim()) return true; // Show recent customers if empty
    const q = customerName.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cust: Customer) => {
    onChangeName(cust.name);
    if (onChangePhone && cust.phone) {
      onChangePhone(cust.phone);
    }
    if (onSelectCustomer) {
      onSelectCustomer(cust);
    }
    setIsOpen(false);
  };

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label">{label}</label>
        {customers.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.72rem',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <History size={12} />
            <span>{isOpen ? 'Hide History' : 'Customer History'}</span>
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={customerName}
          onChange={(e) => {
            onChangeName(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          required={required}
          autoComplete="off"
        />
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && filteredCustomers.length > 0 && (
        <div className="autocomplete-dropdown">
          <div
            style={{
              padding: '6px 10px',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              background: 'var(--bg-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Past Customers ({filteredCustomers.length})
          </div>

          {filteredCustomers.slice(0, 6).map((cust) => {
            const fin = calculateCustomerFinancials(cust, sales, payments, adjustments);
            const isSelected = cust.name.toLowerCase() === customerName.toLowerCase();

            return (
              <div
                key={cust.id}
                className="autocomplete-item"
                onClick={() => handleSelect(cust)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {cust.name}
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>
                      {cust.segment}
                    </span>
                  </div>
                  {cust.phone && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {cust.phone}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: fin.balancePaise > 0 ? '#d97706' : '#059669',
                    }}
                  >
                    {fin.balancePaise > 0 ? `Due: ${formatINR(fin.balancePaise)}` : 'Cleared'}
                  </div>
                  {isSelected && <Check size={14} color="var(--accent-primary)" style={{ marginTop: 2 }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional Phone field if provided */}
      {onChangePhone !== undefined && (
        <div style={{ marginTop: 6 }}>
          <input
            type="tel"
            className="form-input"
            placeholder="Mobile / Phone (Optional for new customer)"
            value={customerPhone}
            onChange={(e) => onChangePhone(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
