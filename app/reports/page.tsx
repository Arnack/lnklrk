"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, BarChart } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and download comprehensive reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
            <CardDescription>
              Detailed analysis of campaign metrics and ROI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Influencer Analytics
            </CardTitle>
            <CardDescription>
              Performance metrics for all influencers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Summary
            </CardTitle>
            <CardDescription>
              Monthly overview of all activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Report generation features are under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Generation</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're building comprehensive reporting tools that will allow you to generate 
              detailed reports on campaign performance, influencer metrics, and business insights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 