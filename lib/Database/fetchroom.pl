#! /usr/bin/perl
use strict;
use warnings;
use DBI;
use JSON;

my $dtroom = 1;

my $dbHandle = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

print "2+2=",$dbHandle->selectrow_array("SELECT 2+2"),"\n";

print $dtroom,"\n";

my $sql = "SELECT * FROM rooms WHERE \"roomNumber\" = ?";

my @row = $dbHandle->selectrow_array($sql,undef,$dtroom);
unless (@row) { die "room not found in database"; }

print @row,"\n";
