package com.jobhuntly.backend.service;

import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

@Service
public class JobSeederService implements ApplicationRunner {

    @Autowired
    private JobRepository jobRepository;

    private static final Object[][] JOBS = {
        {"Social Media Assistant",  "Nomad",      "N",  "bg-emerald-500", "Paris, France",        "Full-Time",  "Marketing,Design",       "Entry Level",  700,  5,  10},
        {"Brand Designer",          "Dropbox",    "D",  "bg-blue-500",    "San Francisco, USA",   "Full-Time",  "Design,Business",        "Mid Level",    1200, 2,  8 },
        {"Interactive Developer",   "Terraform",  "T",  "bg-purple-500",  "Hamburg, Germany",     "Full-Time",  "Marketing,Design",       "Senior Level", 1500, 7,  12},
        {"Email Marketing",         "Revolut",    "R",  "bg-red-500",     "Madrid, Spain",        "Full-Time",  "Marketing,Design",       "Entry Level",  800,  3,  6 },
        {"Lead Engineer",           "Canva",      "Ca", "bg-cyan-500",    "Ankara, Turkey",       "Full-Time",  "Business,Design",        "Director",     2500, 9,  15},
        {"Product Designer",        "Classpass",  "Cp", "bg-teal-500",    "Berlin, Germany",      "Full-Time",  "Business,Design",        "Mid Level",    1100, 4,  5 },
        {"Customer Manager",        "Pitch",      "Pi", "bg-gray-800",    "Berlin, Germany",      "Full-Time",  "Marketing,Design",       "Entry Level",  900,  1,  4 },
        {"Visual Designer",         "Minted",     "Mi", "bg-orange-500",  "Lyon, France",         "Full-Time",  "Marketing,Design",       "Mid Level",    1300, 6,  10},
        {"Java Developer",          "Subtonify",  "Su", "bg-yellow-600",  "Gothenburg, Sweden",   "Part-Time",  "Marketing,Design",       "Senior Level", 1800, 3,  7 },
        {"Email Marketing",         "Revolut",    "R",  "bg-red-500",     "Madrid, Spain",        "Internship", "Marketing,Design",       "Entry Level",  400,  3,  6 },
        {"Product Designer",        "Classpass",  "Cp", "bg-teal-500",    "Berlin, Germany",      "Full-Time",  "Business,Design",        "Director",     2200, 4,  5 },
        {"Customer Manager",        "Pitch",      "Pi", "bg-gray-800",    "Rome, Italy",          "Full-Time",  "Marketing,Design",       "Entry Level",  950,  1,  4 },
        {"Java Developer",          "Subtonify",  "Su", "bg-yellow-600",  "Gothenburg, Sweden",   "Remote",     "Marketing,Design",       "Senior Level", 1800, 3,  7 },
        {"Interactive Developer",   "Terraform",  "T",  "bg-purple-500",  "Hamburg, Germany",     "Contract",   "Marketing,Design",       "Senior Level", 1500, 7,  12},
        {"Email Marketing",         "Revolut",    "R",  "bg-red-500",     "Madrid, Spain",        "Full-Time",  "Marketing,Design",       "VP or Above",  3000, 3,  6 },
        {"Lead Engineer",           "Canva",      "Ca", "bg-cyan-500",    "Ankara, Turkey",       "Full-Time",  "Business,Design",        "Director",     2500, 9,  15},
        {"Product Designer",        "Classpass",  "Cp", "bg-teal-500",    "Berlin, Germany",      "Part-Time",  "Business,Design",        "Mid Level",    1100, 4,  5 },
        {"Customer Manager",        "Pitch",      "Pi", "bg-gray-800",    "Berlin, Germany",      "Full-Time",  "Marketing,Design",       "Entry Level",  900,  1,  4 },
        {"Software Engineer",       "TCS",        "TC", "bg-blue-700",    "Mumbai, India",        "Full-Time",  "Technology,Engineering", "Mid Level",    1400, 12, 20},
        {"Java Developer",          "Capgemini",  "Ca", "bg-indigo-600",  "Pune, India",          "Full-Time",  "Technology,Engineering", "Mid Level",    1200, 8,  15},
        {"Systems Analyst",         "Infosys",    "In", "bg-blue-500",    "Bangalore, India",     "Full-Time",  "Technology,Business",    "Senior Level", 1600, 5,  10},
        {"Cloud Engineer",          "Wipro",      "Wi", "bg-gray-700",    "Hyderabad, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 1800, 6,  12},
        {"Business Analyst",        "Accenture",  "Ac", "bg-purple-600",  "Delhi, India",         "Full-Time",  "Business,Finance",       "Mid Level",    1300, 10, 18},
        {"DevOps Engineer",         "HCL",        "HC", "bg-green-600",   "Noida, India",         "Full-Time",  "Technology,Engineering", "Senior Level", 1700, 4,  8 },
        {"Frontend Developer",      "Tech Mahindra","TM","bg-red-600",    "Chennai, India",       "Full-Time",  "Technology,Design",      "Mid Level",    1100, 7,  14},
        {"Data Analyst",            "Cognizant",  "Co", "bg-blue-600",    "Kolkata, India",       "Full-Time",  "Technology,Business",    "Entry Level",  900,  9,  16},
        {"Cloud Architect",         "IBM",        "IB", "bg-blue-800",    "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Director",     2800, 3,  6 },
        {"Software Engineer II",    "Microsoft",  "Ms", "bg-green-500",   "Hyderabad, India",     "Full-Time",  "Technology,Engineering", "Mid Level",    2200, 15, 25},
        {"SWE Intern",              "Google",     "Go", "bg-yellow-500",  "Bangalore, India",     "Internship", "Technology,Engineering", "Entry Level",  600,  20, 30},
        {"SDE-1",                   "Amazon",     "Am", "bg-orange-500",  "Hyderabad, India",     "Full-Time",  "Technology,Engineering", "Entry Level",  1800, 18, 28},
        {"Product Manager",         "Flipkart",   "Fl", "bg-yellow-600",  "Bangalore, India",     "Full-Time",  "Business,Technology",    "Mid Level",    1600, 11, 20},
        {"Backend Engineer",        "Zomato",     "Zo", "bg-red-500",     "Gurugram, India",      "Full-Time",  "Technology,Engineering", "Mid Level",    1400, 8,  15},
        {"Mobile Developer",        "Swiggy",     "Sw", "bg-orange-600",  "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Mid Level",    1500, 6,  12},
        {"Full Stack Developer",    "Paytm",      "Pa", "bg-blue-500",    "Noida, India",         "Full-Time",  "Technology,Engineering", "Mid Level",    1300, 9,  16},
        {"Data Scientist",          "Ola",        "Ol", "bg-yellow-400",  "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 2000, 5,  10},
        {"Backend Developer",       "Razorpay",   "Ra", "bg-blue-600",    "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 1900, 7,  12},
        {"QA Engineer",             "Freshworks", "Fr", "bg-green-600",   "Chennai, India",       "Full-Time",  "Technology,Engineering", "Mid Level",    1100, 4,  8 },
        {"UI Developer",            "Zoho",       "Zh", "bg-red-600",     "Chennai, India",       "Full-Time",  "Technology,Design",      "Mid Level",    1200, 6,  10},
        {"React Developer",         "MakeMyTrip", "MM", "bg-red-500",     "Gurugram, India",      "Full-Time",  "Technology,Engineering", "Mid Level",    1400, 8,  14},
        {"Node.js Developer",       "Naukri",     "Na", "bg-blue-700",    "Noida, India",         "Full-Time",  "Technology,Engineering", "Mid Level",    1300, 5,  10},
        {"Android Developer",       "PhonePe",    "Ph", "bg-indigo-500",  "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 1800, 9,  15},
        {"iOS Developer",           "CRED",       "CR", "bg-gray-800",    "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 2000, 4,  8 },
        {"Growth Engineer",         "Meesho",     "Me", "bg-pink-500",    "Bangalore, India",     "Full-Time",  "Technology,Business",    "Mid Level",    1500, 7,  12},
        {"Platform Engineer",       "Dream11",    "Dr", "bg-blue-500",    "Mumbai, India",        "Full-Time",  "Technology,Engineering", "Senior Level", 2200, 3,  6 },
        {"UX Designer",             "Lenskart",   "Le", "bg-orange-500",  "Delhi, India",         "Full-Time",  "Design,Business",        "Mid Level",    1200, 6,  10},
        {"Marketing Analyst",       "Nykaa",      "Ny", "bg-pink-600",    "Mumbai, India",        "Full-Time",  "Marketing,Business",     "Entry Level",  900,  8,  14},
        {"Data Engineer",           "PolicyBazaar","PB","bg-blue-600",    "Gurugram, India",      "Full-Time",  "Technology,Engineering", "Senior Level", 1900, 5,  9 },
        {"ML Engineer",             "Cars24",     "C2", "bg-red-600",     "Gurugram, India",      "Full-Time",  "Technology,Engineering", "Senior Level", 2100, 4,  7 },
        {"Fintech Developer",       "Groww",      "Gr", "bg-green-600",   "Bangalore, India",     "Full-Time",  "Technology,Finance",     "Mid Level",    1600, 10, 18},
        {"Quant Developer",         "Zerodha",    "Zr", "bg-blue-500",    "Bangalore, India",     "Full-Time",  "Technology,Finance",     "Senior Level", 2400, 3,  5 },
        {"IT Analyst",              "HDFC Bank",  "HD", "bg-blue-700",    "Mumbai, India",        "Full-Time",  "Technology,Finance",     "Entry Level",  1000, 12, 20},
        {"Software Developer",      "ICICI Bank", "IC", "bg-orange-600",  "Mumbai, India",        "Full-Time",  "Technology,Finance",     "Mid Level",    1300, 8,  15},
        {"Network Engineer",        "Airtel",     "Ai", "bg-red-500",     "Delhi, India",         "Full-Time",  "Technology,Engineering", "Mid Level",    1400, 6,  10},
        {"Telecom Engineer",        "Jio",        "Ji", "bg-blue-500",    "Mumbai, India",        "Full-Time",  "Technology,Engineering", "Mid Level",    1300, 9,  16},
        {"Embedded Engineer",       "Tata Motors","TT", "bg-blue-700",    "Pune, India",          "Full-Time",  "Technology,Engineering", "Senior Level", 1700, 5,  9 },
        {"Automation Engineer",     "Mahindra",   "Ma", "bg-red-600",     "Mumbai, India",        "Full-Time",  "Technology,Engineering", "Senior Level", 1600, 4,  8 },
        {"Consultant",              "Deloitte",   "DL", "bg-green-600",   "Mumbai, India",        "Full-Time",  "Business,Finance",       "Mid Level",    1800, 10, 18},
        {"Technology Analyst",      "PwC",        "PW", "bg-red-600",     "Delhi, India",         "Full-Time",  "Technology,Business",    "Entry Level",  1100, 8,  14},
        {"Advisory Analyst",        "EY",         "EY", "bg-yellow-500",  "Mumbai, India",        "Full-Time",  "Business,Finance",       "Entry Level",  1000, 7,  12},
        {"IT Auditor",              "KPMG",       "KP", "bg-blue-600",    "Delhi, India",         "Full-Time",  "Technology,Finance",     "Mid Level",    1400, 5,  9 },
        {"Business Analyst",        "McKinsey",   "Mc", "bg-blue-800",    "Mumbai, India",        "Full-Time",  "Business,Finance",       "Senior Level", 2500, 4,  7 },
        {"Database Engineer",       "Oracle",     "Or", "bg-red-600",     "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 2000, 6,  10},
        {"SAP Developer",           "SAP",        "SP", "bg-blue-500",    "Bangalore, India",     "Full-Time",  "Technology,Business",    "Mid Level",    1600, 5,  9 },
        {"CRM Developer",           "Salesforce", "SF", "bg-blue-600",    "Hyderabad, India",     "Full-Time",  "Technology,Business",    "Mid Level",    1700, 7,  12},
        {"Creative Engineer",       "Adobe",      "Ab", "bg-red-600",     "Noida, India",         "Full-Time",  "Technology,Design",      "Mid Level",    1500, 6,  10},
        {"Hardware Engineer",       "Intel",      "It", "bg-blue-700",    "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 2200, 4,  7 },
        {"Firmware Engineer",       "Qualcomm",   "Ql", "bg-blue-600",    "Hyderabad, India",     "Full-Time",  "Technology,Engineering", "Senior Level", 2400, 3,  6 },
        {"R&D Engineer",            "Samsung",    "Sm", "bg-blue-800",    "Noida, India",         "Full-Time",  "Technology,Engineering", "Senior Level", 2000, 5,  9 },
        {"IoT Engineer",            "Bosch",      "Bo", "bg-red-700",     "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Mid Level",    1600, 6,  10},
        {"Automation Engineer",     "Siemens",    "Si", "bg-teal-600",    "Mumbai, India",        "Full-Time",  "Technology,Engineering", "Senior Level", 1900, 4,  8 },
        {"Digital Engineer",        "GE",         "GE", "bg-blue-600",    "Bangalore, India",     "Full-Time",  "Technology,Engineering", "Mid Level",    1700, 5,  9 },
        {"Healthcare Dev",          "Philips",    "Pl", "bg-blue-500",    "Pune, India",          "Full-Time",  "Technology,Engineering", "Mid Level",    1500, 4,  8 },
        {"Software Engineer",       "Medtronic",  "Md", "bg-blue-700",    "Hyderabad, India",     "Full-Time",  "Technology,Engineering", "Mid Level",    1600, 5,  9 },
    };

    @Override
    public void run(ApplicationArguments args) {
        for (Object[] row : JOBS) {
            String title   = (String)  row[0];
            String company = (String)  row[1];
            if (jobRepository.existsByTitleAndCompany(title, company)) continue;

            Job job = new Job();
            job.setTitle(title);
            job.setCompany(company);
            job.setLogo((String)  row[2]);
            job.setColor((String) row[3]);
            job.setLocation((String) row[4]);
            job.setType((String)  row[5]);
            job.setCategories((String) row[6]);
            job.setLevel((String) row[7]);
            job.setSalary((Integer) row[8]);
            job.setApplied((Integer) row[9]);
            job.setCapacity((Integer) row[10]);
            jobRepository.save(job);
        }
    }
}
