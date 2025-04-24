using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.Models
{
    public class Customer
    {
        public int CustomerId { get; set; }

        [Required]
        public string Name { get; set; }

        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
    }
}
