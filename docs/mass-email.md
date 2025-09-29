# Mass Email Feature

The Mass Email feature allows you to send personalized emails to multiple influencers at once using customizable templates and recipient management.

## Features

### 🎯 Campaign Management
- Create, edit, and manage email campaigns
- Track campaign status (draft, sending, sent, failed)
- View detailed campaign statistics
- Delete campaigns when no longer needed

### 📧 Email Templates
- Use pre-built email templates for different scenarios
- Customize template variables for personalization
- Support for collaboration, follow-up, contract, and introduction templates
- Create custom email content when templates don't fit

### 👥 Recipient Management
- Add and manage email recipients
- Filter recipients by category, platform, or search terms
- Bulk select/deselect recipients
- View recipient details including followers, platform, and custom fields

### ✨ Personalization
- Automatic personalization using recipient data
- Custom fields for each recipient
- Template variable replacement
- Personalized subject lines and content

### 📊 Analytics & Tracking
- Real-time sending progress
- Success/failure rates
- Individual recipient status tracking
- Campaign performance metrics

## Usage

### Creating a Campaign

1. **Navigate to Mass Email**: Click on "Mass Email" in the navigation menu
2. **Create New Campaign**: Click the "New Campaign" button
3. **Select Recipients**: Choose recipients from your list or add new ones
4. **Choose Content**: Select a template or write custom content
5. **Preview**: Review your email before sending
6. **Send**: Connect Gmail and send your campaign

### Managing Recipients

1. **Add Recipients**: Click "Manage Recipients" to add new contacts
2. **Filter & Search**: Use the search and filter options to find specific recipients
3. **Bulk Actions**: Select multiple recipients for bulk operations

### Using Templates

1. **Select Template**: Choose from available email templates
2. **Fill Variables**: Complete the template variables with your information
3. **Preview**: See how the email will look with your content
4. **Customize**: Modify the content as needed

## API Endpoints

### Campaigns
- `GET /api/mass-email` - Get all campaigns for a user
- `POST /api/mass-email` - Create a new campaign
- `GET /api/mass-email/[id]` - Get specific campaign
- `PUT /api/mass-email/[id]` - Update campaign
- `DELETE /api/mass-email/[id]` - Delete campaign

### Sending
- `POST /api/mass-email/[id]/send` - Send a campaign

## Database Schema

### mass_email_campaigns
- `id` - Unique campaign identifier
- `user_id` - User who created the campaign
- `name` - Campaign name
- `subject` - Email subject line
- `content` - Email content
- `template_id` - Reference to email template
- `template_variables` - Variables used for personalization
- `status` - Campaign status (draft, sending, sent, failed)
- `stats` - Campaign statistics
- `sent_at` - When campaign was sent
- `created_at` - Campaign creation time
- `updated_at` - Last update time

### mass_email_recipients
- `id` - Unique recipient identifier
- `campaign_id` - Associated campaign
- `name` - Recipient name
- `email` - Recipient email address
- `platform` - Social media platform
- `followers` - Follower count
- `category` - Recipient category
- `tags` - Associated tags
- `custom_fields` - Additional personalized fields
- `status` - Sending status (pending, sent, failed)
- `error_message` - Error details if sending failed
- `sent_at` - When email was sent
- `created_at` - Recipient creation time
- `updated_at` - Last update time

## Setup

1. **Database Migration**: Run the mass email migration to create the required tables
2. **Gmail Integration**: Ensure Gmail API is properly configured
3. **Authentication**: Set up user authentication for campaign management

## Best Practices

### Email Content
- Keep subject lines concise and compelling
- Use personalization to increase engagement
- Test emails before sending to large lists
- Follow email marketing best practices

### Recipient Management
- Regularly clean your recipient list
- Use categories and tags for better organization
- Verify email addresses before adding
- Respect unsubscribe requests

### Campaign Management
- Start with small test campaigns
- Monitor delivery rates and engagement
- Keep detailed records of campaign performance
- Use A/B testing for subject lines and content

## Troubleshooting

### Common Issues
- **Gmail Authentication**: Ensure Gmail is properly connected
- **Rate Limiting**: Gmail has sending limits; campaigns are sent with delays
- **Template Variables**: Make sure all required variables are filled
- **Recipient Validation**: Check that email addresses are valid

### Support
For technical issues or questions, please refer to the main application documentation or contact support.
