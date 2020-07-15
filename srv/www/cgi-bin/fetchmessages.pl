#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);

my $q = new CGI;
print $q->header();
my $dtmessage = $q->param("value");
my @dtmessage =  split('~', $dtmessage);


my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});


#this will fetch each of the requested messages and create a string ready to use.
#to be completed once we know the syntax of the list of messages that we will receive

print "{ \"messages\" : \"";

my $sql = "SELECT \"Message\" FROM messages WHERE \"ID\" = ?";
my @row;

foreach (@dtmessage) {

  @row = $dbh->selectrow_array($sql,undef,$_);
  unless (@row) { die "\{oops\}requested message not found in database\n\n"; }
  chomp(@row);
  print join (" ", @row);
}

print "\" }\n\n";
