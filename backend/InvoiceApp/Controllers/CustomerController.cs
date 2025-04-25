using InvoiceApp.Data;
using InvoiceApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly InvoiceAppContext _context;

        public CustomerController(InvoiceAppContext context)
        {
            _context = context;
        }
        // GET : api/Customer
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.ToListAsync();
        }



        // GET : api/Customer/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }

        // POST : api/Customer
        [HttpPost]

        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustomerId }, customer);
        }

        // DELETE : api/Customer/id
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(true);
        }
    }
}
