#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);


my $cgi = new CGI;
print $cgi->header();

my $q = new CGI;
my $dtroom = $q->param("value");




my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

my $sth = $dbh->prepare("SELECT * FROM rooms WHERE 1=0");
$sth->execute();
my $fields = $sth->{NAME};


my $sql = "SELECT * FROM rooms WHERE \"roomNumber\" = ?";

my @row = $dbh->selectrow_array($sql,undef,$dtroom);
unless (@row) { die "\{oops\}room not found in database\n\n"; }

my %hash;

@hash{@$fields} = @row;

my $json = encode_json \%hash;

print $json,"\n\n";
