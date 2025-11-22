from datetime import datetime, timedelta

def get_mock_emails():
    """Returns a list of rich, realistic email dictionaries."""
    
    base_time = datetime.utcnow()
    
    return [
        {
            "sender": "newsletter@techweekly.com",
            "subject": "The Future of AI Agents in 2025: What You Need to Know",
            "body": """
Hi Tech Enthusiast,

Welcome to this week's edition of TechWeekly! Today, we are diving deep into the world of Agentic AI.

1. The Rise of Autonomous Agents
The era of simple chatbots is over. In 2025, we are seeing a massive shift towards "Agentic Workflows"—systems that can plan, critique, and execute tasks autonomously. Frameworks like LangGraph are leading the charge.

2. Multi-Agent Systems
Why use one LLM when you can use five? Orchestration layers are becoming the new standard for enterprise applications.

3. The "Human-in-the-loop" Pattern
Despite the autonomy, keeping a human in the loop for critical decisions (like sending an email) remains a best practice.

Don't miss our webinar next Thursday where we build a live agent from scratch!

Cheers,
The TechWeekly Team
            """,
            "timestamp": base_time - timedelta(minutes=45)
        },
        {
            "sender": "hr@globex-corp.com",
            "subject": "ACTION REQUIRED: 2025 Employee Benefits Enrollment",
            "body": """
Dear Nikhita,

This is a reminder that the Open Enrollment period for your 2025 Employee Benefits ends this Friday at 5:00 PM EST.

If you do not make a selection by then, your current coverage will NOT automatically renew. You must log in to the portal and re-elect your medical, dental, and vision plans.

Key Changes this Year:
- The PPO plan deductible has increased to $1,500.
- We have added a new "Mental Health Day" policy.
- The HSA contribution limit is now $4,150 for individuals.

Please review the attached PDF guide for more details. If you have questions, reply to this email or schedule a time with HR.

Regards,
Sarah Jenkins
HR Director, Globex Corp
            """,
            "timestamp": base_time - timedelta(hours=2)
        },
        {
            "sender": "alerts@chase-security.com",
            "subject": "Security Alert: Unusual Sign-in Detected",
            "body": """
Security Alert

We detected a sign-in attempt to your Chase Online Banking account from a new device.

Device: iPhone 15 Pro
Location: Bangalore, India
Time: Just now

If this was you, you can ignore this message. 
If you do not recognize this activity, please secure your account immediately by clicking the link below:

[Secure My Account]

Do not share your OTP with anyone. Chase will never ask for your password over the phone.

Thank you,
Chase Security Team
            """,
            "timestamp": base_time - timedelta(hours=5)
        },
        {
            "sender": "project.manager@internal-dev.com",
            "subject": "URGENT: Q4 Roadmap Review Meeting Slides",
            "body": """
Hi Nikhita,

I hope you're having a good week.

We have the Q4 Roadmap Review with the VP of Engineering tomorrow morning at 10 AM. I noticed the slide deck is still missing the section on "AI Integration."

Could you please prioritize this? We need to show:
1. The architecture diagram for the new RAG pipeline.
2. The estimated latency improvements.
3. A cost breakdown of the Groq vs. OpenAI usage.

Please send me the updated deck by EOD today so I can review it before the meeting.

Thanks,
David
            """,
            "timestamp": base_time - timedelta(days=1)
        },
        {
            "sender": "mom.james@gmail.com",
            "subject": "Re: Dinner plans this weekend?",
            "body": """
Hi sweetie!

Just checking if you're still coming home this weekend? Dad bought that fresh fish you like, and I was planning to make the curry on Saturday night.

Also, Auntie Susan is in town and might stop by on Sunday lunch. Let me know your train timings so Dad can pick you up from the station.

Love,
Mom
            """,
            "timestamp": base_time - timedelta(days=2)
        },
        {
            "sender": "billing@aws.amazon.com",
            "subject": "Invoice #99281-AWS: Payment Failed",
            "body": """
Hello,

We attempted to charge your card ending in 4242 for the amount of $45.20 USD for your AWS usage in October, but the transaction was declined.

Reason: Insufficient Funds / Generic Decline.

Please update your payment method immediately to avoid service interruption. Your EC2 instances and S3 buckets may be suspended if payment is not received within 3 days.

Log in to the AWS Console > Billing Dashboard to resolve this.

Sincerely,
Amazon Web Services
            """,
            "timestamp": base_time - timedelta(days=3)
        },
        {
            "sender": "recruiter@google.com",
            "subject": "Google: Software Engineer, Early Career - Application Update",
            "body": """
Hi Nikhita,

Thank you for applying to the Software Engineer, Early Career position at Google.

We were impressed by your resume and your background in Agentic AI and LangGraph. We would like to invite you to a 45-minute technical phone screen next week.

Please reply to this email with your availability for next Monday, Tuesday, or Wednesday between 9 AM and 5 PM PST.

Looking forward to connecting!

Best,
Jennifer Wu
Technical Recruiter, Google
            """,
            "timestamp": base_time - timedelta(days=4)
        },
        {
            "sender": "notifications@slack.com",
            "subject": "New mention in #engineering-general",
            "body": """
You have a new mention in Slack.

Channel: #engineering-general
User: @alex_dev

Message:
"@Nikhita regarding the API latency spike last night—did we deploy the new caching layer? I'm seeing some timeouts in the logs."

[Open in Slack]
            """,
            "timestamp": base_time - timedelta(hours=8)
        },
        {
            "sender": "newsletter@morningbrew.com",
            "subject": "Markets: Tech stocks tumble, Bitcoin rallies",
            "body": """
Good morning! Here is what you need to know today.

1. Market Watch
The S&P 500 dipped 1.2% yesterday as major tech earnings missed expectations. Meanwhile, Bitcoin surged past $65k again.

2. Deep Dive: The Agent Economy
Everyone is talking about AI Agents. But how do you monetize them? We explore the new business models emerging in Silicon Valley.

3. Coffee Break
Did you know? The first computer bug was an actual moth stuck in a relay.

Read the full story on our website.
            """,
            "timestamp": base_time - timedelta(days=2)
        },
        {
            "sender": "support@jira.atlassian.com",
            "subject": "[JIRA] (PROJ-102) Login Button Fails on Mobile Safari",
            "body": """
Issue PROJ-102 has been assigned to you.

Reporter: QA Team
Priority: High
Status: To Do

Description:
When a user tries to log in using Safari on iOS 17, the "Login" button becomes unresponsive. This seems to be related to the recent CSS update.

Please investigate and provide a fix by the end of the sprint.

[View Issue]
            """,
            "timestamp": base_time - timedelta(days=1)
        },
        {
            "sender": "ceo@startup-stealth.io",
            "subject": "All Hands Meeting: Big Announcement",
            "body": """
Team,

I have some incredibly exciting news to share with you all. We have officially closed our Series A funding round!

This is a huge milestone for us. I want to thank everyone for the hard work over the last 6 months.

Please join the All Hands meeting tomorrow at 10:00 AM where I will share the details and our roadmap for the next year.

Let's go!
Elon (not that one)
            """,
            "timestamp": base_time - timedelta(days=3)
        },
        {
            "sender": "billing@netflix.com",
            "subject": "Your membership has been renewed",
            "body": """
Hi Nikhita,

We hope you're enjoying Netflix.

This email is to confirm that your Premium Plan subscription has been renewed. We've charged $22.99 to your card.

Upcoming releases you might like:
- Black Mirror: Season 7
- Stranger Things: The Finale

Enjoy watching!
The Netflix Team
            """,
            "timestamp": base_time - timedelta(days=6)
        },
        {
            "sender": "spam@prize-winner-2025.net",
            "subject": "CONGRATS! You won a Tesla Model S!",
            "body": """
FINAL NOTICE: You have been selected as the grand prize winner!

You have won a BRAND NEW Tesla Model S. 

To claim your prize, you just need to pay the shipping fee of $199.99 via Bitcoin or Gift Card. 

Click here NOW or your prize will be given to the next person in line!!

[CLAIM PRIZE]
            """,
            "timestamp": base_time - timedelta(days=7)
        },
        {
            "sender": "colleague@workplace.com",
            "subject": "Lunch?",
            "body": """
Hey,

A few of us are heading to the food court in about 10 minutes. We were thinking of getting Mexican.

Do you want to join us? Or should we bring you something back?

Let me know!
            """,
            "timestamp": base_time - timedelta(hours=4)
        },
        {
            "sender": "feedback@uber.com",
            "subject": "Rate your ride with Michael",
            "body": """
Thanks for riding with Uber.

We hope you had a great trip with Michael yesterday. Please take a moment to rate your driver. 

[ 5 Stars ]  [ 4 Stars ]  [ 3 Stars ]  [ 2 Stars ]  [ 1 Star ]

Did you leave something behind? Contact support.
            """,
            "timestamp": base_time - timedelta(days=5)
        }
    ]
