// Script to migrate from NotificationModal to Toast notifications
// Run with: node migrate-to-toast.js

const fs = require('fs');
const path = require('path');

const files = [
    'resources/js/Components/Admin/Payments/index.jsx',
    'resources/js/Components/Admin/Request/index.jsx',
    'resources/js/Pages/Admin/Users.jsx',
    'resources/js/Components/Request_form/index.jsx'
];

function migrateFile(filePath) {
    console.log(`\nMigrating: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove NotificationModal import
    content = content.replace(
        /import\s+{\s*NotificationModal\s*}\s+from\s+["']@\/[Cc]omponents\/ui\/notification-modal["'];?\n?/g,
        ''
    );
    
    // Remove duplicate useToast import if exists
    const useToastMatches = content.match(/import\s+{\s*useToast\s*}\s+from/g);
    if (useToastMatches && useToastMatches.length > 1) {
        // Keep first, remove others
        let first = true;
        content = content.replace(
            /import\s+{\s*useToast\s*}\s+from\s+["']@\/[Cc]omponents\/ui\/use-toast["'];?\n?/g,
            (match) => {
                if (first) {
                    first = false;
                    return match;
                }
                return '';
            }
        );
    }
    
    // Add useToast import if not present
    if (!content.includes('import { useToast }')) {
        const importSection = content.match(/^import.*from.*;\n/gm);
        if (importSection) {
            const lastImport = importSection[importSection.length - 1];
            content = content.replace(
                lastImport,
                lastImport + 'import { useToast } from "@/components/ui/use-toast";\n'
            );
        }
    }
    
    // Remove notificationModal state
    content = content.replace(
        /const\s+\[notificationModal,\s*setNotificationModal\]\s*=\s*useState\({[^}]*}\);?\n?/g,
        ''
    );
    
    // Add toast hook if not present
    if (!content.includes('const { toast } = useToast()')) {
        // Find where to add it (after other useState declarations)
        const stateMatch = content.match(/(const\s+\[[^\]]+\]\s*=\s*useState[^;]+;)/);
        if (stateMatch) {
            content = content.replace(
                stateMatch[0],
                stateMatch[0] + '\n    const { toast } = useToast();'
            );
        }
    }
    
    // Replace setNotificationModal calls with toast
    // Success notifications
    content = content.replace(
        /setNotificationModal\(\{\s*isOpen:\s*true,\s*type:\s*["']success["'],\s*title:\s*["']([^"']+)["'],\s*message:\s*["']([^"']+)["'],\s*buttonText:\s*["'][^"']+["'],?\s*\}\);?/g,
        'toast({\n                        title: "$1",\n                        description: "$2",\n                    });'
    );
    
    // Error notifications
    content = content.replace(
        /setNotificationModal\(\{\s*isOpen:\s*true,\s*type:\s*["']error["'],\s*title:\s*["']([^"']+)["'],\s*message:\s*["']([^"']+)["'],\s*buttonText:\s*["'][^"']+["'],?\s*\}\);?/g,
        'toast({\n                        variant: "destructive",\n                        title: "$1",\n                        description: "$2",\n                    });'
    );
    
    // Warning notifications
    content = content.replace(
        /setNotificationModal\(\{\s*isOpen:\s*true,\s*type:\s*["']warning["'],\s*title:\s*["']([^"']+)["'],\s*message:\s*["']([^"']+)["'],\s*buttonText:\s*["'][^"']+["'],?\s*\}\);?/g,
        'toast({\n                variant: "destructive",\n                title: "$1",\n                description: "$2",\n            });'
    );
    
    // Remove NotificationModal component usage
    content = content.replace(
        /<NotificationModal[\s\S]*?\/>/g,
        ''
    );
    
    // Remove empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
}

// Run migration
files.forEach(file => {
    try {
        migrateFile(file);
    } catch (error) {
        console.error(`❌ Error migrating ${file}:`, error.message);
    }
});

console.log('\n✅ Migration complete!');
console.log('\nNext steps:');
console.log('1. Review the changes');
console.log('2. Test all notification scenarios');
console.log('3. Run: npm run build');
