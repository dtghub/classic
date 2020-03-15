#!/usr/bin/perl -w
#print "Content-type: application/json\n\n";
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);


#my $dtroom = 1;
my $cgi = new CGI;
print $cgi->header();
#print "$FormData";
#print "{'This is a': 'test'}\n\n"

my $q = new CGI;
#print $q->header();
my $dtroom = $q->param("value");

#$dtroom = 1;

#print $dtroom;



my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

#print "2+2=",$dbh->selectrow_array("SELECT 2+2"),"\n";

#print $dtroom,"\n";

my $sth = $dbh->prepare("SELECT * FROM rooms WHERE 1=0");
$sth->execute();
my $fields = $sth->{NAME};


my $sql = "SELECT * FROM rooms WHERE \"roomNumber\" = ?";

my @row = $dbh->selectrow_array($sql,undef,$dtroom);
unless (@row) { die "\{oops\}room not found in database\n\n"; }

#print @row,"\n";


my %hash;

@hash{@$fields} = @row;

#print %hash,"\n";

my $json = encode_json \%hash;

print $json,"\n\n";
