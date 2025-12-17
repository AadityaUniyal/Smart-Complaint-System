
# Docker Build and Deploy Script for Smart Complaint System

set -e  # Exit on any error

echo "🐳 Smart Complaint System - Docker Build & Deploy"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running!"
        exit 1
    fi
    
    print_success "Docker is running"
}

# Check database connection
check_database() {
    print_status "Checking database connection..."
    if python scripts/check_db_size.py > /dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_warning "Database connection failed - continuing anyway"
    fi
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    # Create logs directory
    mkdir -p logs
    
    # Build the image
    docker build -t smart-complaint-system:latest . || {
        print_error "Docker build failed!"
        exit 1
    }
    
    print_success "Docker image built successfully"
}

# Run with Docker Compose
deploy_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.docker .env
        print_warning "Created .env from .env.docker template"
        print_warning "Please update .env with your actual values"
    fi
    
    # Start services
    docker-compose up -d || {
        print_error "Docker Compose deployment failed!"
        exit 1
    }
    
    print_success "Services deployed successfully"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  🌐 Frontend: http://localhost"
    echo "  📡 Backend API: http://localhost:5000"
    echo "  🏥 Health Check: http://localhost:5000/api/health"
    echo "  📊 Redis: localhost:6379"
}

# Show logs
show_logs() {
    print_status "Recent logs:"
    docker-compose logs --tail=20
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down
    docker system prune -f
    print_success "Cleanup completed"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "build")
            check_docker
            check_database
            build_image
            ;;
        "deploy")
            check_docker
            check_database
            build_image
            deploy_compose
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "cleanup")
            cleanup
            ;;
        "help")
            echo "Usage: $0 [build|deploy|status|logs|cleanup|help]"
            echo ""
            echo "Commands:"
            echo "  build   - Build Docker image only"
            echo "  deploy  - Build and deploy with Docker Compose (default)"
            echo "  status  - Show service status"
            echo "  logs    - Show recent logs"
            echo "  cleanup - Stop services and cleanup"
            echo "  help    - Show this help"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"