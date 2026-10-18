package kz.aitusa.crm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaWebController {

    @GetMapping("/")
    public String rootRedirect() {
        return "redirect:/crm/";
    }

    @GetMapping("/crm")
    public String crmRedirect() {
        return "redirect:/crm/";
    }

    @GetMapping({
            "/crm/",
            "/crm/login",
            "/crm/tasks",
            "/crm/tasks/**",
            "/crm/my-tasks",
            "/crm/admin-search"
    })
    public String forwardCrmSpa() {
        return "forward:/crm/index.html";
    }
}
