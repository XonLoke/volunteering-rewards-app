# Workflow Analysis v4 — Supervisor Feedback Incorporated

> **Updated:** 21 May 2026  
> **Changes:** Added approval gate, admin registers merchants + products, PIN at coupon creation, reset password, statistics charts. Cashier app & organiser attendance app use PWA. Merchant self-registration is Phase 2.

---

## (A) Volunteers (Mobile App Users)

### Registration
- Download app
- Register to be a volunteer
- Login the app
- Visit the volunteering event "store"
- Select a volunteering event for participation
- Edit selected events (add, delete/cancel, post feedback, search Q&A)
- Auto link to volunteers' calendars in their phones
- Post past events participation photos and notes on the V-social platform *

### Participation
- Scheduler alarm as reminders (notification) before and on schedule dates
- Check the event/campaign location
- Reach location and check-in to participate event
- Write feedback and event + the organizer

### After Completed Volunteering Task
- Scan QR codes scanned by organizer (onsite controller) through mobile app
- Earn points

### Redemption
- Online or visit the store
- Scan QR codes for redemption
- Redeem reward coupons with 6-digit PIN

### Optional Add-on
- * Volunteers Social Platform (Pull strategy for volunteers recruitment)
- Sponsorship / Referral system (Push strategy for volunteers recruitment)
- Hall-Of-Fame billboard for volunteers

---

## (B) Events Organiser (Web App & Mobile App users)

### Registration (web app)
- Visit website and register organization with uploaded official approval documents (most are statutory boards)
- **─── WAIT FOR ADMIN APPROVAL ───**
- Input information of events and person in-charge in the scheduling system
- Edit uploaded events (delete, add, amendment)
- Review volunteers feedback and suggestions and evaluate event + person-in-charge assessment

### On-site Controller (PWA — mobile web app)
- Person-in-charge take attendance
- After completed event, scan volunteer's QR code
- Statistic Charts to show various info about campaigns being organized
- Built as PWA (Progressive Web App) — installable on mobile devices via browser

---

## Volunteering Programme Organisation

The volunteering programme organisation should solicit merchant sponsorship of goods and services as the rewards for the volunteers.

---

## (C) Dbase Controller — Admin (System Operator)

- **─── Approve or reject organiser (verify official documents) ───**
- **─── Register merchants and their products into the system ───**
- **─── Once merchant is registered, items for product equals to certain points redemption table can be added ───**
- Manage the reward system (Points-Reward value and products list)
- Verify official documents of approval from the events organisers applications
- Issue 6-digit PIN code and create reward coupons (code printed on coupon)
- Manage database of users, merchants, reward-system, QR codes, campaigns
- View all users and their points balance
- Reset user password
- Deactivate / remove accounts
- View redemption history
- View event participation records

---

## (D) Merchants / Cashiers

> **Note:** Merchant SELF-REGISTRATION portal is a **Phase 2 feature** (not in current scope).  
> For this sprint cycle, the **ADMIN registers merchants and their products** into the system (see Section C).  
> The cashier redemption flow (PIN verification) is the core merchant feature being built.

### Redemption (Cashier) — In Scope
- Verify coupons via 6-digit PIN
- Mark coupon as redeemed
- View redemption history
- Built as PWA (Progressive Web App) — installable on mobile devices via browser

### Self-Registration — Phase 2 (Not in Current Scope)
- Visit website and register as participating merchant & person-in-charge
- Visit Reward-Store (virtual store) and upload the reward info to be contributed
- Edit the uploaded rewards (delete, add, amendment)
- Publish reward to Reward-Store

### Optional Add-on (Phase 2)
- Merchant Sponsorship for the event (Merchant PR program)
- Advertising / Promotion Application (Merchant's incentive)
